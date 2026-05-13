import { Injectable, Logger } from '@nestjs/common'
import { IntentResult, Timeframe } from '../intent/intent.parser'

export interface FallbackContext {
  userId: string
  userMessage: string
  intent: IntentResult
  error?: any
  conversationHistory?: Array<{
    userMessage: string
    assistantMessage?: string
  }>
}

export interface FallbackResponse {
  response: string
  confidence: number // 0-1, how confident we are in this fallback
  type: 'error_recovery' | 'deterministic' | 'simplified'
  metadata?: Record<string, any>
}

@Injectable()
export class FallbackResponseBuilder {
  private readonly logger = new Logger(FallbackResponseBuilder.name)

  /**
   * Build a fallback response based on context and intent
   */
  buildFallbackResponse(context: FallbackContext): FallbackResponse {
    // Try different fallback strategies in order of preference
    const strategies = [
      this.buildCriticalQueryResponse.bind(this),
      this.buildIntentBasedResponse.bind(this),
      this.buildErrorRecoveryResponse.bind(this),
      this.buildGenericFallbackResponse.bind(this),
    ]

    for (const strategy of strategies) {
      try {
        const response = strategy(context)
        if (response) {
          this.logger.debug(
            `Generated fallback response of type: ${response.type} with confidence: ${response.confidence}`,
          )
          return response
        }
      } catch (error) {
        this.logger.warn(`Fallback strategy failed:`, error)
      }
    }

    // Ultimate fallback
    return this.buildGenericFallbackResponse(context)
  }

  /**
   * Handle critical financial queries with deterministic responses
   */
  private buildCriticalQueryResponse(
    context: FallbackContext,
  ): FallbackResponse | null {
    const message = context.userMessage.toLowerCase()

    // Critical financial queries that need deterministic responses
    const criticalPatterns = [
      /\b(balance|balances)\b/,
      /\b(account|accounts)\b.*\b(status|summary)\b/,
      /\b(security|secure|login|password)\b/,
      /\b(delete|remove|erase)\b.*\b(account|data|information)\b/,
      /\b(transfer|send|move)\b.*\b(money|funds)\b/,
      /\b(payment|pay)\b.*\b(due|overdue|late)\b/,
      /\b(emergency|urgent)\b/,
    ]

    const isCritical = criticalPatterns.some((pattern) => pattern.test(message))

    if (!isCritical) {
      return null
    }

    let response = ''
    let confidence = 0.9

    if (/\b(balance|balances)\b/.test(message)) {
      response =
        'For account balance inquiries, please check your account dashboard or contact customer support at support@financialapp.com for immediate assistance.'
    } else if (/\b(security|secure|login|password)\b/.test(message)) {
      response =
        'For security-related concerns including login issues or password resets, please visit our secure portal at secure.financialapp.com or call our support line at 1-800-SECURE.'
      confidence = 0.95
    } else if (/\b(delete|remove|erase)\b/.test(message)) {
      response =
        'For account deletion or data removal requests, please contact our customer support team at support@financialapp.com. This requires verification and cannot be processed through chat.'
      confidence = 0.95
    } else if (/\b(transfer|send|move)\b.*\b(money|funds)\b/.test(message)) {
      response =
        'For money transfers or fund movements, please use the secure transfer section in your account dashboard. For assistance, contact support at support@financialapp.com.'
      confidence = 0.9
    } else if (/\b(payment|pay)\b.*\b(due|overdue|late)\b/.test(message)) {
      response =
        'For payment due dates and overdue notices, please check your account dashboard or billing section. Contact support at support@financialapp.com for payment extension requests.'
      confidence = 0.9
    } else {
      response =
        'This appears to be a critical financial inquiry. For your security, please contact our customer support team at support@financialapp.com or call 1-800-FINANCE for immediate assistance.'
      confidence = 0.85
    }

    return {
      response,
      confidence,
      type: 'deterministic',
      metadata: {
        criticalQuery: true,
        detectedPatterns: criticalPatterns
          .filter((p) => p.test(message))
          .map((p) => p.source),
      },
    }
  }

  /**
   * Build response based on parsed intent when AI is unavailable
   */
  private buildIntentBasedResponse(
    context: FallbackContext,
  ): FallbackResponse | null {
    const { intent } = context

    // Only provide intent-based responses for non-critical queries
    if (this.isCriticalIntent(intent)) {
      return null
    }

    let response = ''
    let confidence = 0.7

    // Timeframe-based responses
    if (intent.timeframe) {
      const timeframeDesc = this.getTimeframeDescription(intent.timeframe)
      response += `I understand you're asking about your financial data for ${timeframeDesc}. `
    }

    // Category-based responses
    if (intent.categories && intent.categories.length > 0) {
      const categories = intent.categories.join(', ')
      response += `Regarding ${categories}, `
    }

    // Query type responses
    const queryType = this.classifyQueryType(intent.originalQuery)

    switch (queryType) {
      case 'spending_analysis':
        response +=
          "you can view your spending analysis in the 'Analytics' section of your dashboard. Look for spending breakdowns by category and trends over time."
        break
      case 'budget_check':
        response +=
          "you can check your budget status in the 'Budget' section. You'll see how your spending compares to your budgeted amounts for each category."
        break
      case 'transaction_history':
        response +=
          "you can view your transaction history in the 'Transactions' section. Use the filters to narrow down by date, category, or amount."
        break
      case 'income_analysis':
        response +=
          "you can analyze your income sources in the 'Income' section of your dashboard. This shows your income trends and sources over time."
        break
      case 'goal_progress':
        response +=
          "you can track your financial goals progress in the 'Goals' section. See how close you are to achieving your savings targets."
        break
      default:
        response +=
          'you can find this information in your account dashboard. Try navigating to the relevant section or use the search feature.'
        confidence = 0.6
    }

    response +=
      ' If you need help finding something specific, feel free to ask!'

    return {
      response,
      confidence,
      type: 'simplified',
      metadata: {
        intentBased: true,
        queryType,
        timeframe: intent.timeframe?.label,
        categories: intent.categories,
      },
    }
  }

  /**
   * Build error recovery response when services fail
   */
  private buildErrorRecoveryResponse(
    context: FallbackContext,
  ): FallbackResponse {
    const { error } = context
    let response = ''
    let confidence = 0.5

    if (error) {
      // Classify error types and provide specific guidance
      if (
        error.message?.includes('rate limit') ||
        error.message?.includes('Rate limit')
      ) {
        response =
          "I'm currently receiving too many requests. Please wait a moment and try your question again."
        confidence = 0.8
      } else if (
        error.message?.includes('timeout') ||
        error.message?.includes('Timeout')
      ) {
        response =
          'The request is taking longer than expected. Please try again in a few moments.'
        confidence = 0.7
      } else if (
        error.message?.includes('network') ||
        error.message?.includes('Network')
      ) {
        response =
          'There seems to be a connectivity issue. Please check your internet connection and try again.'
        confidence = 0.6
      } else if (
        error.message?.includes('AI') ||
        error.message?.includes('model')
      ) {
        response =
          'Our AI assistant is temporarily unavailable. You can still access your financial data through the dashboard sections.'
        confidence = 0.7
      } else {
        response =
          "I'm experiencing technical difficulties right now. Please try again in a few moments, or access your information directly through the dashboard."
        confidence = 0.5
      }
    } else {
      response =
        "I'm currently unable to process your request due to a technical issue. Please try again in a few moments, or access your information through the dashboard sections."
      confidence = 0.5
    }

    return {
      response,
      confidence,
      type: 'error_recovery',
      metadata: {
        errorType: this.classifyError(error),
        originalError: error?.message,
      },
    }
  }

  /**
   * Build generic fallback response as last resort
   */
  private buildGenericFallbackResponse(
    context: FallbackContext,
  ): FallbackResponse {
    const responses = [
      "I'm sorry, I'm currently unable to assist with that request. Please try again later or visit your account dashboard for the information you need.",
      'I apologize for the inconvenience. Our AI assistant is temporarily unavailable. You can access all your financial information through the dashboard sections.',
      "We're experiencing technical difficulties. Please try your request again in a few moments, or use the dashboard to access your financial data.",
    ]

    const randomResponse =
      responses[Math.floor(Math.random() * responses.length)]

    return {
      response: randomResponse,
      confidence: 0.3,
      type: 'error_recovery',
      metadata: {
        generic: true,
      },
    }
  }

  /**
   * Check if intent represents a critical query
   */
  private isCriticalIntent(intent: IntentResult): boolean {
    const criticalKeywords = [
      'balance',
      'security',
      'password',
      'delete',
      'transfer',
      'emergency',
      'urgent',
      'payment',
      'due',
      'overdue',
      'account',
      'login',
    ]

    const query = intent.originalQuery.toLowerCase()
    return criticalKeywords.some((keyword) => query.includes(keyword))
  }

  /**
   * Classify the type of financial query
   */
  private classifyQueryType(query: string): string {
    const lowerQuery = query.toLowerCase()

    if (/\b(spend|spending|expense|cost|paid|expenses)\b/.test(lowerQuery)) {
      return 'spending_analysis'
    }
    if (/\b(budget|limit|planned|target)\b/.test(lowerQuery)) {
      return 'budget_check'
    }
    if (
      /\b(transaction|transactions|history|record|activity|show)\b/.test(
        lowerQuery,
      )
    ) {
      return 'transaction_history'
    }
    if (/\b(income|earn|salary|revenue|deposit)\b/.test(lowerQuery)) {
      return 'income_analysis'
    }
    if (/\b(goal|save|saving|target|objective)\b/.test(lowerQuery)) {
      return 'goal_progress'
    }

    return 'general'
  }

  /**
   * Get a human-readable description of the timeframe
   */
  private getTimeframeDescription(timeframe: Timeframe): string {
    // If timeframe has a label, prefer using it
    if (timeframe.label) {
      return timeframe.label
    }

    const now = new Date()
    const start = new Date(timeframe.start)
    const end = new Date(timeframe.end)

    // Check if it's a single day (up to 24 hours inclusive)
    const duration = Math.abs(end.getTime() - start.getTime())
    if (duration <= 24 * 60 * 60 * 1000) {
      // less than or equal to 24 hours
      if (start.toDateString() === now.toDateString()) {
        return 'today'
      } else if (start < now) {
        return 'yesterday'
      } else {
        return 'in the future'
      }
    }

    // Check if timeframe is in the past and approximately a week
    if (now > end) {
      const duration = end.getTime() - start.getTime()
      const durationDays = duration / (1000 * 60 * 60 * 24)
      if (durationDays >= 6 && durationDays <= 8) {
        return 'last week'
      }
    }

    // Check if timeframe includes today
    if (start <= now && now <= end) {
      // Check if it's the current week (start within last 8 days)
      const daysSinceStart =
        (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceStart <= 8) {
        return 'this week'
      } else {
        return 'last week'
      }
    }

    // Other past timeframes
    if (now > end) {
      const diffTime = now.getTime() - end.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      const diffWeeks = Math.floor(diffDays / 7)

      if (diffWeeks === 1) return 'last week'
      if (diffWeeks <= 4) return `${diffWeeks} weeks ago`

      return 'in the past'
    }

    // Timeframe is in the future
    return 'in the future'
  } /**
   * Classify error type for better error handling
   */
  private classifyError(error: any): string {
    if (!error) return 'unknown'

    const message = error.message?.toLowerCase() || ''

    if (
      message.includes('rate limit') ||
      message.includes('too many requests')
    ) {
      return 'rate_limit'
    }
    if (message.includes('timeout') || message.includes('timed out')) {
      return 'timeout'
    }
    if (message.includes('network') || message.includes('connection')) {
      return 'network'
    }
    if (
      message.includes('ai') ||
      message.includes('model') ||
      message.includes('gemini')
    ) {
      return 'ai_service'
    }
    if (message.includes('database') || message.includes('db')) {
      return 'database'
    }

    return 'general'
  }

  /**
   * Get fallback statistics for monitoring
   */
  getFallbackStats(): Record<string, any> {
    // This would track fallback usage in a real implementation
    return {
      totalFallbacks: 0,
      byType: {
        deterministic: 0,
        simplified: 0,
        error_recovery: 0,
      },
      byErrorType: {},
      averageConfidence: 0,
    }
  }
}
