import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export interface ConversationMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface ConversationContext {
  conversationId: string
  messages: ConversationMessage[]
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, any>
}

export interface ContextWindowConfig {
  maxMessages: number
  maxTokens: number
  maxAgeHours: number
  preserveSystemMessages: boolean
}

@Injectable()
export class ConversationContextManagerService {
  private readonly logger = new Logger(ConversationContextManagerService.name)
  private readonly contexts = new Map<string, ConversationContext>()
  private readonly defaultConfig: ContextWindowConfig = {
    maxMessages: 50,
    maxTokens: 8000,
    maxAgeHours: 24,
    preserveSystemMessages: true,
  }

  constructor(private configService: ConfigService) {}

  /**
   * Create a new conversation context
   */
  createConversation(
    conversationId: string,
    metadata?: Record<string, any>,
  ): ConversationContext {
    const context: ConversationContext = {
      conversationId,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata,
    }

    this.contexts.set(conversationId, context)
    this.logger.log(`Created new conversation context: ${conversationId}`)
    return context
  }

  /**
   * Get conversation context by ID
   */
  getConversation(conversationId: string): ConversationContext | null {
    return this.contexts.get(conversationId) || null
  }

  /**
   * Add a message to the conversation
   */
  addMessage(
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: Record<string, any>,
  ): ConversationMessage {
    let context = this.contexts.get(conversationId)
    if (!context) {
      context = this.createConversation(conversationId)
    }

    const message: ConversationMessage = {
      id: this.generateMessageId(),
      role,
      content,
      timestamp: new Date(),
      metadata,
    }

    context.messages.push(message)
    context.updatedAt = new Date()

    // Apply context window management
    this.applyContextWindow(context)

    this.logger.debug(`Added ${role} message to conversation ${conversationId}`)
    return message
  }

  /**
   * Get the current context window for AI processing
   */
  getContextWindow(
    conversationId: string,
    config?: Partial<ContextWindowConfig>,
  ): ConversationMessage[] {
    const context = this.contexts.get(conversationId)
    if (!context) {
      return []
    }

    const effectiveConfig = { ...this.defaultConfig, ...config }
    let messages = [...context.messages]

    // Filter by age
    const cutoffTime = new Date(
      Date.now() - effectiveConfig.maxAgeHours * 60 * 60 * 1000,
    )
    messages = messages.filter((msg) => msg.timestamp >= cutoffTime)

    // Preserve system messages if configured
    if (effectiveConfig.preserveSystemMessages) {
      const systemMessages = messages.filter((msg) => msg.role === 'system')
      const nonSystemMessages = messages.filter((msg) => msg.role !== 'system')

      // Apply limits to non-system messages
      const limitedNonSystem = this.limitMessages(
        nonSystemMessages,
        effectiveConfig,
      )

      // Combine system messages with limited non-system messages
      const combinedMessages = [...systemMessages, ...limitedNonSystem]

      // Apply final limits to ensure we don't exceed constraints
      messages = this.limitMessages(combinedMessages, effectiveConfig)
    } else {
      messages = this.limitMessages(messages, effectiveConfig)
    }

    return messages
  }

  /**
   * Clear conversation context
   */
  clearConversation(conversationId: string): boolean {
    const existed = this.contexts.delete(conversationId)
    if (existed) {
      this.logger.log(`Cleared conversation context: ${conversationId}`)
    }
    return existed
  }

  /**
   * Get conversation statistics
   */
  getConversationStats(conversationId: string): {
    messageCount: number
    totalTokens: number
    oldestMessage: Date | null
    newestMessage: Date | null
  } | null {
    const context = this.contexts.get(conversationId)
    if (!context || context.messages.length === 0) {
      return null
    }

    const messages = context.messages
    const totalTokens = messages.reduce(
      (sum, msg) => sum + this.estimateTokens(msg.content),
      0,
    )

    return {
      messageCount: messages.length,
      totalTokens,
      oldestMessage: messages[0].timestamp,
      newestMessage: messages[messages.length - 1].timestamp,
    }
  }

  /**
   * List all active conversations
   */
  listConversations(): string[] {
    return Array.from(this.contexts.keys())
  }

  /**
   * Clean up old conversations
   */
  cleanupOldConversations(maxAgeHours: number = 48): number {
    const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000)
    let cleanedCount = 0

    for (const [conversationId, context] of this.contexts.entries()) {
      if (context.updatedAt < cutoffTime) {
        this.contexts.delete(conversationId)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      this.logger.log(`Cleaned up ${cleanedCount} old conversations`)
    }

    return cleanedCount
  }

  /**
   * Apply context window management to a conversation
   */
  private applyContextWindow(context: ConversationContext): void {
    const config = this.defaultConfig
    let messages = context.messages

    // Remove messages older than max age
    const cutoffTime = new Date(
      Date.now() - config.maxAgeHours * 60 * 60 * 1000,
    )
    messages = messages.filter((msg) => msg.timestamp >= cutoffTime)

    // Limit by message count and token count
    messages = this.limitMessages(messages, config)

    context.messages = messages
  }

  /**
   * Limit messages by count and token constraints
   */
  private limitMessages(
    messages: ConversationMessage[],
    config: ContextWindowConfig,
  ): ConversationMessage[] {
    // Always include system messages first
    const systemMessages = messages.filter((msg) => msg.role === 'system')
    const nonSystemMessages = messages.filter((msg) => msg.role !== 'system')

    // Sort non-system messages by timestamp (oldest first)
    const sortedNonSystem = nonSystemMessages.sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    )

    // Start with system messages
    const result: ConversationMessage[] = [...systemMessages]
    let totalTokens = systemMessages.reduce(
      (sum, msg) => sum + this.estimateTokens(msg.content),
      0,
    )

    // Add most recent non-system messages within remaining limits
    const remainingSlots = Math.max(
      0,
      config.maxMessages - systemMessages.length,
    )

    for (
      let i = sortedNonSystem.length - 1;
      i >= 0 && result.length < config.maxMessages;
      i--
    ) {
      const msg = sortedNonSystem[i]
      const msgTokens = this.estimateTokens(msg.content)

      if (totalTokens + msgTokens <= config.maxTokens) {
        result.unshift(msg) // Add to beginning to maintain chronological order
        totalTokens += msgTokens
      }
    }

    // Sort final result by timestamp
    return result.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }

  /**
   * Estimate token count for a message (rough approximation)
   */
  private estimateTokens(content: string): number {
    // Rough approximation: 1 token per 4 characters
    return Math.ceil(content.length / 4)
  }

  /**
   * Generate a unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}
