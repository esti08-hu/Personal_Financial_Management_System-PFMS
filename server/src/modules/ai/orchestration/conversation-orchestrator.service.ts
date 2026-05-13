import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AggregationService } from "../aggregation/aggregation.service";
import { AnomalyDetectionService } from "../anomaly/anomaly-detection.service";
import { CacheService } from "../caching/cache.service";
import {
  ConversationContextManagerService,
  ConversationMessage,
} from "../context/conversation-context-manager.service";
import { ConversationRepository } from "../conversation/conversation.repository";
import {
  FormattedResponse,
  ResponseFormatterService,
} from "../formatter/response-formatter.service";
import {
  ChatRequest,
  ChatResponse,
  GeminiClient,
} from "../gemini/gemini-client.service";
import { IntentParser, IntentResult } from "../intent/intent.parser";
import { RateLimitService } from "../rate-limit/rate-limit.service";

export interface ConversationTurn {
  id: string;
  userMessage: string;
  assistantMessage?: string;
  intent?: IntentResult;
  aggregates?: any;
  isProcessed: boolean;
  isFallback: boolean;
  createdAt: Date;
  processedAt?: Date;
}

export interface OrchestrationResult {
  response: string;
  formattedResponse?: FormattedResponse;
  intent: IntentResult;
  aggregates?: any;
  anomalies?: any[];
  cached: boolean;
  fallback: boolean;
  processingTime: number;
}

export interface OrchestrationContext {
  userId: string;
  conversationId: string;
  userMessage: string;
  conversationHistory?: ConversationTurn[];
  forceRefresh?: boolean;
  skipCache?: boolean;
}

@Injectable()
export class ConversationOrchestratorService {
  private readonly logger = new Logger(ConversationOrchestratorService.name);
  private readonly maxRetries = 3;
  private readonly contextWindowSize = 10; // Number of recent turns to include in context

  constructor(
    private configService: ConfigService,
    private intentParser: IntentParser,
    private aggregationService: AggregationService,
    private anomalyDetectionService: AnomalyDetectionService,
    private cacheService: CacheService,
    private rateLimitService: RateLimitService,
    private geminiClient: GeminiClient,
    private conversationRepository: ConversationRepository,
    private contextManager: ConversationContextManagerService,
    private responseFormatter: ResponseFormatterService // Inject ResponseFormatterService
  ) {}

  /**
   * Process a conversation turn through the complete AI pipeline
   */
  async processConversation(
    context: OrchestrationContext
  ): Promise<OrchestrationResult> {
    const startTime = Date.now();
    let fallback = false;
    let cached = false;

    try {
      // 1. Check rate limits
      await this.checkRateLimits(context.userId);

      // 2. Ensure conversation exists in database
      await this.ensureConversationExists(
        context.userId,
        context.conversationId
      );

      // 3. Add user message to context
      this.contextManager.addMessage(
        context.conversationId,
        "user",
        context.userMessage
      );

      // 4. Parse intent from user message
      const intent = this.intentParser.parseIntent(context.userMessage);
      this.logger.debug(`Parsed intent for user ${context.userId}:`, intent);

      // 3. Check cache for similar queries (skip if force refresh)
      let cachedResult: OrchestrationResult | null = null;
      if (!context.skipCache && !context.forceRefresh) {
        cachedResult = await this.checkCache(context.userId, intent);
        if (cachedResult) {
          cached = true;
          this.logger.debug(`Cache hit for user ${context.userId}`);
          return {
            ...cachedResult,
            cached: true,
            processingTime: Date.now() - startTime,
          };
        }
      }

      // 4. Get conversation context
      const conversationContext = await this.buildConversationContext(context);

      // Perform data aggregation based on intent
      const aggregates = await this.performAggregation(
        context.userId,
        intent,
        context.userMessage
      );

      // 6. Detect anomalies in the aggregated data
      const anomalies = await this.detectAnomalies(
        context.userId,
        aggregates,
        intent
      );

      // 7. Generate AI response using Gemini
      const aiResponse = await this.generateAIResponse(
        context,
        intent,
        aggregates,
        anomalies,
        conversationContext
      );

      // 8. Format the response for consistent output
      const formattedResponse = this.formatResponse(
        aiResponse,
        intent,
        aggregates,
        anomalies
      );

      // Add assistant response to context
      this.contextManager.addMessage(
        context.conversationId,
        "assistant",
        formattedResponse.text
      );

      // 9. Persist the turn to database
      await this.persistTurn(context, {
        response: aiResponse,
        formattedResponse: formattedResponse,
        intent,
        aggregates,
        anomalies,
        cached: false,
        fallback: false,
        processingTime: Date.now() - startTime,
      });

      // 10. Cache the result for future use
      if (!context.skipCache) {
        await this.cacheResult(context.userId, intent, {
          response: aiResponse,
          intent,
          aggregates,
          anomalies,
          cached: false,
          fallback: false,
          processingTime: Date.now() - startTime,
        });
      }

      const result: OrchestrationResult = {
        response: aiResponse,
        formattedResponse: formattedResponse,
        intent,
        aggregates,
        anomalies,
        cached: false,
        fallback: false,
        processingTime: Date.now() - startTime,
      };

      this.logger.debug(
        `Successfully processed conversation for user ${context.userId} in ${result.processingTime}ms`
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Error processing conversation for user ${context.userId}:`,
        error
      );

      // Try fallback response
      try {
        const fallbackResponse = await this.generateFallbackResponse(
          context,
          error
        );
        const formattedFallback = this.responseFormatter.formatErrorResponse(
          fallbackResponse,
          "Please try rephrasing your question or contact support if the issue persists."
        );
        fallback = true;

        return {
          response: formattedFallback.text,
          formattedResponse: formattedFallback,
          intent: this.intentParser.parseIntent(context.userMessage),
          cached: false,
          fallback: true,
          processingTime: Date.now() - startTime,
        };
      } catch (fallbackError) {
        this.logger.error(
          `Fallback response failed for user ${context.userId}:`,
          fallbackError
        );

        // Return a generic error response
        const genericError = this.responseFormatter.formatErrorResponse(
          "I'm sorry, I'm experiencing technical difficulties right now.",
          "Please try again later or contact support if the issue persists."
        );

        return {
          response: genericError.text,
          formattedResponse: genericError,
          intent: this.intentParser.parseIntent(context.userMessage),
          cached: false,
          fallback: true,
          processingTime: Date.now() - startTime,
        };
      }
    }
  }

  /**
   * Check rate limits for the user
   */
  private async checkRateLimits(userId: string): Promise<void> {
    const result = await this.rateLimitService.checkLimit(
      userId,
      "conversation"
    );
    if (!result.allowed) {
      throw new Error(
        "Rate limit exceeded. Please wait before sending another message."
      );
    }
  }

  /**
   * Check cache for similar queries
   */
  private async checkCache(
    userId: string,
    intent: IntentResult
  ): Promise<OrchestrationResult | null> {
    const cacheKey = this.generateCacheKey(userId, intent);

    try {
      const cached = await this.cacheService.get(cacheKey);
      if (cached && this.isCacheValid(cached, intent)) {
        return cached as OrchestrationResult;
      }
    } catch (error) {
      this.logger.warn(`Cache retrieval failed for user ${userId}:`, error);
    }

    return null;
  }

  /**
   * Generate cache key for intent-based queries
   */
  private generateCacheKey(userId: string, intent: IntentResult): string {
    const keyComponents = [
      `user_${userId}`,
      intent.query.substring(0, 50), // Limit query length
      intent.timeframe?.label || "no_timeframe",
      intent.categories?.sort().join("_") || "no_categories",
    ];

    return keyComponents.join("|");
  }

  /**
   * Check if cached result is still valid
   */
  private isCacheValid(cached: any, intent: IntentResult): boolean {
    // Cache is valid for 1 hour
    const cacheAge = Date.now() - (cached.cachedAt || 0);
    const maxAge = 60 * 60 * 1000; // 1 hour

    if (cacheAge > maxAge) {
      return false;
    }

    // For queries with specific timeframes, cache is only valid for shorter periods
    if (intent.timeframe) {
      const timeframeCacheAge = 15 * 60 * 1000; // 15 minutes for timeframe queries
      if (cacheAge > timeframeCacheAge) {
        return false;
      }
    }

    return true;
  }

  /**
   * Build conversation context from context manager
   */
  private async buildConversationContext(
    context: OrchestrationContext
  ): Promise<string> {
    // Get recent messages from context manager
    const messages = this.contextManager.getContextWindow(
      context.conversationId,
      {
        maxMessages: this.contextWindowSize,
        preserveSystemMessages: true,
      }
    );

    if (messages.length === 0) {
      return "";
    }

    // Convert messages to conversation format
    const contextParts: string[] = [];
    for (const message of messages) {
      if (message.role === "user") {
        contextParts.push(`User: ${message.content}`);
      } else if (message.role === "assistant") {
        contextParts.push(`Assistant: ${message.content}`);
      } else if (message.role === "system") {
        contextParts.push(`System: ${message.content}`);
      }
    }

    return `Previous conversation:\n${contextParts.join("\n")}\n\n`;
  }

  /**
   * Perform data aggregation based on intent
   */
  private async performAggregation(
    userId: string,
    intent: IntentResult,
    userMessage?: string
  ): Promise<any> {
    try {
      // Check if this is a transaction-related query
      const isTransactionQuery = this.isTransactionRelatedQuery(
        userMessage || intent.originalQuery
      );

      // Check if this query requires specific transaction details
      const requiresDetails = this.requiresTransactionDetails(
        userMessage || intent.originalQuery
      );

      // Always get aggregates for transaction-related queries, or when timeframe/categories are specified
      if (
        isTransactionQuery ||
        intent.timeframe ||
        (intent.categories && intent.categories.length > 0)
      ) {
        // Use the aggregation service to get financial data based on intent
        const aggregates = await this.aggregationService.aggregateFinancialData(
          userId,
          intent.timeframe,
          intent.categories
        );

        // If the query requires specific transaction details, include more recent transactions
        if (requiresDetails && aggregates.recentTransactions) {
          // Get more transactions for detailed queries
          const detailedTransactions = await this.aggregationService.getRecentTransactions(
            userId,
            10, // Get last 10 transactions for detailed queries
            intent.timeframe,
            intent.categories
          );
          aggregates.recentTransactions = detailedTransactions;
        }

        this.logger.debug(`Aggregated data for user ${userId}:`, aggregates);
        return aggregates;
      }

      this.logger.debug(
        `No aggregation needed for user ${userId} - not a transaction query`
      );
      return null;
    } catch (error) {
      this.logger.warn(`Data aggregation failed for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Detect anomalies in aggregated data
   */
  private async detectAnomalies(
    userId: string,
    aggregates: any,
    intent: IntentResult
  ): Promise<any[]> {
    if (!aggregates) {
      return [];
    }

    try {
      const anomalyResult = await this.anomalyDetectionService.detectAnomalies(
        userId,
        aggregates.totalExpenses,
        intent.timeframe
      );

      this.logger.debug(`Detected anomaly for user ${userId}:`, anomalyResult);

      // Return as array for consistency with interface
      return anomalyResult.isAnomaly ? [anomalyResult] : [];
    } catch (error) {
      this.logger.warn(`Anomaly detection failed for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Generate AI response using Gemini
   */
  private async generateAIResponse(
    context: OrchestrationContext,
    intent: IntentResult,
    aggregates: any,
    anomalies: any[],
    conversationContext: string
  ): Promise<string> {
    // Build the system prompt
    const systemPrompt = this.buildSystemPrompt(intent, aggregates, anomalies);

    // Get recent conversation messages
    const recentMessages = this.contextManager.getContextWindow(
      context.conversationId,
      {
        maxMessages: this.contextWindowSize - 1, // Reserve space for current message
        preserveSystemMessages: true,
      }
    );

    // Build conversation messages
    const messages: ChatRequest["messages"] = [];

    // Add recent conversation messages (excluding the current user message)
    for (const msg of recentMessages) {
      if (
        msg.role === "system" ||
        msg.role === "assistant" ||
        msg.role === "user"
      ) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // Add current user message
    messages.push({
      role: "user",
      content: context.userMessage,
    });

    const chatRequest: ChatRequest = {
      messages,
      systemPrompt,
      temperature: 0.7,
      maxTokens: 2048,
    };

    // Make the API call with retry logic
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await this.geminiClient.chat(chatRequest);
        return response.content;
      } catch (error) {
        this.logger.warn(
          `Gemini API call failed (attempt ${attempt + 1}/${this.maxRetries}):`,
          error
        );

        if (attempt === this.maxRetries - 1) {
          throw error; // Re-throw on last attempt
        }

        // Wait before retrying
        await this.delay(1000 * Math.pow(2, attempt));
      }
    }

    throw new Error("Failed to generate AI response after all retries");
  }

  /**
   * Build system prompt based on intent and data
   */
  private buildSystemPrompt(
    intent: IntentResult,
    aggregates: any,
    anomalies: any[]
  ): string {
    let prompt = `You are a helpful financial assistant. Analyze the user's query and provide insights based on their financial data.

User Query Context:
- Query: "${intent.originalQuery}"
- Timeframe: ${intent.timeframe?.label || "Not specified"}
- Categories: ${intent.categories?.join(", ") || "Not specified"}

`;

    if (aggregates) {
      prompt += `
Financial Data Summary:
${JSON.stringify(aggregates, null, 2)}

`;

      // Include recent transactions if available
      if (aggregates.recentTransactions && aggregates.recentTransactions.length > 0) {
        prompt += `
Recent Transactions (most recent first):
${aggregates.recentTransactions.map((tx: any, index: number) =>
  `${index + 1}. ${tx.type}: $${tx.amount} on ${new Date(tx.createdAt).toLocaleDateString()}${tx.description ? ` - ${tx.description}` : ''}`
).join('\n')}

`;
      }
    }

    if (anomalies && anomalies.length > 0) {
      prompt += `
Detected Anomalies:
${anomalies.map((anomaly, index) => `${index + 1}. ${anomaly.description}`).join("\n")}

`;
    }

    prompt += `
Guidelines:
- Be helpful, accurate, and concise
- Focus on the user's specific query and timeframe
- Highlight important insights and trends
- If anomalies are detected, explain them clearly
- Use the financial data to provide concrete numbers and examples
- Suggest actionable recommendations when appropriate
- Maintain a professional and friendly tone

Please provide a comprehensive response to the user's query.`;

    return prompt;
  }

  /**
   * Generate fallback response when AI fails
   */
  private async generateFallbackResponse(
    context: OrchestrationContext,
    error: any
  ): Promise<string> {
    // For now, return a simple fallback message
    // This will be enhanced by the FallbackResponseBuilder in T014
    return `I apologize, but I'm currently unable to process your request due to a technical issue. Your query was: "${context.userMessage}". Please try again in a few moments, or contact support if the problem persists.`;
  }

  /**
   * Cache the result for future use
   */
  private async cacheResult(
    userId: string,
    intent: IntentResult,
    result: OrchestrationResult
  ): Promise<void> {
    const cacheKey = this.generateCacheKey(userId, intent);
    const cacheData = {
      ...result,
      cachedAt: Date.now(),
    };

    try {
      await this.cacheService.set(cacheKey, cacheData, { ttl: 3600000 }); // Cache for 1 hour (in milliseconds)
      this.logger.debug(
        `Cached result for user ${userId} with key: ${cacheKey}`
      );
    } catch (error) {
      this.logger.warn(`Failed to cache result for user ${userId}:`, error);
    }
  }

  /**
   * Utility method for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check if a query is related to transactions/financial data
   */
  private isTransactionRelatedQuery(query: string): boolean {
    const transactionKeywords = [
      "transaction",
      "transactions",
      "spend",
      "spending",
      "spent",
      "expense",
      "expenses",
      "income",
      "deposit",
      "withdrawal",
      "transfer",
      "payment",
      "payments",
      "balance",
      "budget",
      "financial",
      "money",
      "cash",
      "account",
      "accounts",
      "bank",
      "finance",
      "purchase",
      "buy",
      "bought",
      "cost",
      "costs",
      "price",
      "amount",
      "total",
      "summary",
      "report",
      "analysis",
      "analytics",
      "trend",
      "trends",
      "habit",
      "habits",
      "pattern",
      "patterns",
      "category",
      "categories",
      "month",
      "monthly",
      "week",
      "weekly",
      "day",
      "daily",
      "year",
      "yearly",
      "period",
      "time",
      "date",
      "dates",
    ];

    const lowerQuery = query.toLowerCase();
    return transactionKeywords.some((keyword) => lowerQuery.includes(keyword));
  }

  /**
   * Check if a query requires specific transaction details (not just aggregates)
   */
  private requiresTransactionDetails(query: string): boolean {
    const specificTransactionKeywords = [
      "last",
      "recent",
      "latest",
      "previous",
      "specific",
      "particular",
      "what was",
      "what did",
      "when did",
      "how much",
      "where did",
      "which",
      "details",
      "detail",
      "individual",
      "specific transaction",
      "that transaction",
      "this transaction",
    ];

    const lowerQuery = query.toLowerCase();
    return specificTransactionKeywords.some((keyword) => lowerQuery.includes(keyword));
  }

  /**
   * Format the response for consistent output
   */
  private formatResponse(
    aiResponse: string,
    intent: IntentResult,
    aggregates: any,
    anomalies: any[]
  ): FormattedResponse {
    // Try to determine the response type based on intent and data
    if (anomalies && anomalies.length > 0) {
      // Format as anomaly alert
      return this.responseFormatter.formatAnomalyAlert(
        anomalies.map((anomaly) => ({
          description:
            anomaly.description || "Unusual financial activity detected",
          severity: anomaly.severity || "medium",
          impact: anomaly.impact || "May affect your financial planning",
          recommendation: anomaly.recommendation,
        }))
      );
    }

    if (aggregates && intent.query.toLowerCase().includes("summary")) {
      // Format as financial summary
      const totalIncome = aggregates.totalIncome || 0;
      const totalExpenses = aggregates.totalExpenses || 0;
      const netSavings = totalIncome - totalExpenses;
      const timeframe = intent.timeframe?.label || "Current period";

      return this.responseFormatter.formatFinancialSummary(
        totalIncome,
        totalExpenses,
        netSavings,
        timeframe
      );
    }

    if (aggregates && intent.query.toLowerCase().includes("spend")) {
      // Format as spending analysis
      const categoryBreakdown = aggregates.categoryBreakdown || [];
      const totalSpent = aggregates.totalExpenses || 0;
      const timeframe = intent.timeframe?.label || "Current period";

      return this.responseFormatter.formatSpendingAnalysis(
        categoryBreakdown,
        totalSpent,
        timeframe
      );
    }

    // Default to raw response formatting
    return this.responseFormatter.formatRawResponse(aiResponse);
  }

  /**
   * Ensure conversation exists in database and load context if needed
   */
  private async ensureConversationExists(
    userId: string,
    conversationId: string
  ): Promise<void> {
    try {
      const existingConversation =
        await this.conversationRepository.getConversationById(conversationId);
      if (!existingConversation) {
        // Create new conversation
        await this.conversationRepository.createConversation({ userId });
        this.logger.debug(
          `Created new conversation ${conversationId} for user ${userId}`
        );
      } else {
        // Load existing conversation turns into context manager
        await this.loadConversationContext(conversationId);
        this.logger.debug(
          `Loaded existing conversation ${conversationId} with ${existingConversation.turns.length} turns`
        );
      }
    } catch (error) {
      this.logger.error(
        `Error ensuring conversation exists for user ${userId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Load conversation turns from database into context manager
   */
  private async loadConversationContext(conversationId: string): Promise<void> {
    try {
      const conversation =
        await this.conversationRepository.getConversationById(conversationId);
      if (conversation && conversation.turns) {
        // Clear any existing context first
        this.contextManager.clearConversation(conversationId);

        // Load turns into context manager (most recent first for context window)
        for (const turn of conversation.turns) {
          if (turn.userMessage) {
            this.contextManager.addMessage(
              conversationId,
              "user",
              turn.userMessage
            );
          }
          if (turn.assistantMessage) {
            this.contextManager.addMessage(
              conversationId,
              "assistant",
              turn.assistantMessage
            );
          }
        }
      }
    } catch (error) {
      this.logger.error(
        `Error loading conversation context for ${conversationId}:`,
        error
      );
      // Don't throw - continue with empty context if loading fails
    }
  }

  /**
   * Persist turn to database
   */
  private async persistTurn(
    context: OrchestrationContext,
    result: OrchestrationResult
  ): Promise<void> {
    try {
      await this.conversationRepository.createTurn({
        conversationId: context.conversationId,
        userMessage: context.userMessage,
        assistantMessage: result.response,
        intent: result.intent,
        aggregates: result.aggregates,
        isProcessed: true,
        isFallback: result.fallback,
      });
      this.logger.debug(
        `Persisted turn for conversation ${context.conversationId}`
      );
    } catch (error) {
      this.logger.error(
        `Error persisting turn for conversation ${context.conversationId}:`,
        error
      );
      // Don't throw here - we don't want to fail the response if persistence fails
    }
  }
}
