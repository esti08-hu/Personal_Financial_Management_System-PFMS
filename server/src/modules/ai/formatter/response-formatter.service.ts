import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export interface FormattedResponse {
  text: string
  type: 'success' | 'error' | 'warning' | 'info' | 'confirmation'
  metadata?: Record<string, any>
  formatted: boolean
}

export interface FinancialData {
  amount?: number
  currency?: string
  category?: string
  date?: Date | string
  description?: string
  trend?: 'up' | 'down' | 'stable'
  percentage?: number
}

export interface TransactionData extends FinancialData {
  type: 'income' | 'expense' | 'transfer'
  account?: string
  merchant?: string
}

export interface BudgetData extends FinancialData {
  spent: number
  budgeted: number
  remaining: number
  status: 'on_track' | 'over_budget' | 'under_budget'
}

export interface GoalData extends FinancialData {
  target: number
  current: number
  progress: number // percentage
  deadline?: Date
  status: 'on_track' | 'behind' | 'completed'
}

export interface AnomalyData {
  description: string
  severity: 'low' | 'medium' | 'high'
  impact: string
  recommendation?: string
}

@Injectable()
export class ResponseFormatterService {
  private readonly logger = new Logger(ResponseFormatterService.name)
  private readonly defaultCurrency = 'USD'

  constructor(private configService: ConfigService) {}

  /**
   * Format a financial summary response
   */
  formatFinancialSummary(
    totalIncome: number,
    totalExpenses: number,
    netSavings: number,
    timeframe: string,
    metadata?: Record<string, any>,
  ): FormattedResponse {
    const currency = this.getCurrencySymbol()

    let response = `📊 **Financial Summary** (${timeframe})\n\n`

    response += `💰 **Total Income:** ${this.formatCurrency(totalIncome)}\n`
    response += `💸 **Total Expenses:** ${this.formatCurrency(totalExpenses)}\n`
    response += `💾 **Net Savings:** ${this.formatCurrency(netSavings)} `

    if (netSavings > 0) {
      response += `✅ (Positive savings!)`
    } else if (netSavings < 0) {
      response += `⚠️ (Negative savings - consider reviewing expenses)`
    } else {
      response += `🤔 (Break-even)`
    }

    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0
    response += `\n\n📈 **Savings Rate:** ${savingsRate.toFixed(1)}%`

    return {
      text: response,
      type: netSavings >= 0 ? 'success' : 'warning',
      metadata,
      formatted: true,
    }
  }

  /**
   * Format spending analysis response
   */
  formatSpendingAnalysis(
    categoryBreakdown: Array<{
      category: string
      amount: number
      percentage: number
    }>,
    totalSpent: number,
    timeframe: string,
    topCategory?: string,
    metadata?: Record<string, any>,
  ): FormattedResponse {
    let response = `📈 **Spending Analysis** (${timeframe})\n\n`
    response += `💸 **Total Spent:** ${this.formatCurrency(totalSpent)}\n\n`

    if (topCategory) {
      response += `🏆 **Top Category:** ${topCategory}\n\n`
    }

    response += `📊 **Category Breakdown:**\n`
    categoryBreakdown
      .sort((a, b) => b.amount - a.amount)
      .forEach((item, index) => {
        const emoji = this.getCategoryEmoji(item.category)
        response += `${index + 1}. ${emoji} ${item.category}: ${this.formatCurrency(item.amount)} (${item.percentage.toFixed(1)}%)\n`
      })

    return {
      text: response,
      type: 'info',
      metadata,
      formatted: true,
    }
  }

  /**
   * Format transaction list response
   */
  formatTransactionList(
    transactions: TransactionData[],
    timeframe: string,
    metadata?: Record<string, any>,
  ): FormattedResponse {
    if (transactions.length === 0) {
      return {
        text: `📝 **No transactions found** for ${timeframe}.\n\nTry adjusting your search criteria or timeframe.`,
        type: 'info',
        metadata,
        formatted: true,
      }
    }

    let response = `📝 **Recent Transactions** (${timeframe})\n\n`

    transactions.slice(0, 10).forEach((transaction, index) => {
      const emoji =
        transaction.type === 'income'
          ? '💰'
          : transaction.type === 'expense'
            ? '💸'
            : '🔄'
      const sign =
        transaction.type === 'income'
          ? '+'
          : transaction.type === 'expense'
            ? '-'
            : ''
      const date = this.formatDate(transaction.date)

      response += `${index + 1}. ${emoji} ${sign}${this.formatCurrency(transaction.amount)}`
      if (transaction.description) {
        response += ` - ${transaction.description}`
      }
      if (transaction.category) {
        response += ` (${transaction.category})`
      }
      response += `\n   📅 ${date}\n`
    })

    if (transactions.length > 10) {
      response += `\n... and ${transactions.length - 10} more transactions.`
    }

    return {
      text: response,
      type: 'info',
      metadata,
      formatted: true,
    }
  }

  /**
   * Format budget status response
   */
  formatBudgetStatus(
    budgets: BudgetData[],
    timeframe: string,
    metadata?: Record<string, any>,
  ): FormattedResponse {
    let response = `🎯 **Budget Status** (${timeframe})\n\n`

    let onTrackCount = 0
    let overBudgetCount = 0

    budgets.forEach((budget) => {
      const emoji = this.getBudgetStatusEmoji(budget.status)
      const percentage =
        budget.budgeted > 0 ? (budget.spent / budget.budgeted) * 100 : 0

      response += `${emoji} **${budget.category}:**\n`
      response += `   Spent: ${this.formatCurrency(budget.spent)} / ${this.formatCurrency(budget.budgeted)}\n`
      response += `   Remaining: ${this.formatCurrency(budget.remaining)} (${percentage.toFixed(1)}%)\n\n`

      if (budget.status === 'on_track') onTrackCount++
      if (budget.status === 'over_budget') overBudgetCount++
    })

    // Summary
    response += `📊 **Summary:** ${onTrackCount} on track, ${overBudgetCount} over budget`

    if (overBudgetCount > 0) {
      response += `\n⚠️ Consider reviewing your spending in over-budget categories.`
    }

    return {
      text: response,
      type: overBudgetCount > 0 ? 'warning' : 'success',
      metadata,
      formatted: true,
    }
  }

  /**
   * Format goal progress response
   */
  formatGoalProgress(
    goals: GoalData[],
    metadata?: Record<string, any>,
  ): FormattedResponse {
    if (goals.length === 0) {
      return {
        text: `🎯 **No savings goals found.**\n\nStart by setting up your first financial goal to track your progress!`,
        type: 'info',
        metadata,
        formatted: true,
      }
    }

    let response = `🎯 **Savings Goals Progress**\n\n`

    goals.forEach((goal) => {
      const emoji = this.getGoalStatusEmoji(goal.status)
      const deadline = goal.deadline
        ? ` (Due: ${this.formatDate(goal.deadline)})`
        : ''

      response += `${emoji} **${goal.description || 'Goal'}:**\n`
      response += `   Progress: ${this.formatCurrency(goal.current)} / ${this.formatCurrency(goal.target)}\n`
      response += `   ${goal.progress.toFixed(1)}% complete${deadline}\n\n`
    })

    const completedGoals = goals.filter((g) => g.status === 'completed').length
    if (completedGoals > 0) {
      response += `🎉 **${completedGoals} goal(s) completed!** Keep up the great work!`
    }

    return {
      text: response,
      type: 'info',
      metadata,
      formatted: true,
    }
  }

  /**
   * Format anomaly alert response
   */
  formatAnomalyAlert(
    anomalies: AnomalyData[],
    metadata?: Record<string, any>,
  ): FormattedResponse {
    if (anomalies.length === 0) {
      return {
        text: `✅ **No anomalies detected** in your recent financial activity.`,
        type: 'success',
        metadata,
        formatted: true,
      }
    }

    let response = `⚠️ **Financial Anomalies Detected**\n\n`
    response += `I've identified ${anomalies.length} unusual pattern(s) in your financial data:\n\n`

    anomalies.forEach((anomaly, index) => {
      const emoji = this.getAnomalySeverityEmoji(anomaly.severity)
      response += `${index + 1}. ${emoji} **${anomaly.severity.toUpperCase()}**: ${anomaly.description}\n`
      response += `   💡 **Impact:** ${anomaly.impact}\n`

      if (anomaly.recommendation) {
        response += `   🛠️ **Recommendation:** ${anomaly.recommendation}\n`
      }
      response += `\n`
    })

    response += `💡 **Tip:** Anomalies don't always indicate problems, but they're worth reviewing.`

    return {
      text: response,
      type: 'warning',
      metadata,
      formatted: true,
    }
  }

  /**
   * Format error response
   */
  formatErrorResponse(
    error: string,
    suggestion?: string,
    metadata?: Record<string, any>,
  ): FormattedResponse {
    let response = `❌ **Error**\n\n${error}`

    if (suggestion) {
      response += `\n\n💡 **Suggestion:** ${suggestion}`
    }

    return {
      text: response,
      type: 'error',
      metadata,
      formatted: true,
    }
  }

  /**
   * Format success confirmation response
   */
  formatSuccessResponse(
    message: string,
    details?: string,
    metadata?: Record<string, any>,
  ): FormattedResponse {
    let response = `✅ **Success**\n\n${message}`

    if (details) {
      response += `\n\n${details}`
    }

    return {
      text: response,
      type: 'success',
      metadata,
      formatted: true,
    }
  }

  /**
   * Format informational response
   */
  formatInfoResponse(
    message: string,
    details?: string,
    metadata?: Record<string, any>,
  ): FormattedResponse {
    let response = `ℹ️ **Information**\n\n${message}`

    if (details) {
      response += `\n\n${details}`
    }

    return {
      text: response,
      type: 'info',
      metadata,
      formatted: true,
    }
  }

  /**
   * Format raw text response (fallback)
   */
  formatRawResponse(
    text: string,
    metadata?: Record<string, any>,
  ): FormattedResponse {
    return {
      text,
      type: 'info',
      metadata,
      formatted: false,
    }
  }

  /**
   * Get currency symbol
   */
  private getCurrencySymbol(): string {
    const currency = this.configService.get<string>(
      'CURRENCY',
      this.defaultCurrency,
    )
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$',
      AUD: 'A$',
    }
    return symbols[currency] || '$'
  }

  /**
   * Format currency amount
   */
  private formatCurrency(amount: number): string {
    const symbol = this.getCurrencySymbol()
    return `${symbol}${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  /**
   * Format date
   */
  private formatDate(date: Date | string | undefined): string {
    if (!date) return 'Unknown date'

    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  /**
   * Get emoji for category
   */
  private getCategoryEmoji(category: string): string {
    const lowerCategory = category.toLowerCase()
    const emojis: Record<string, string> = {
      food: '🍽️',
      groceries: '🛒',
      dining: '🍽️',
      transportation: '🚗',
      gas: '⛽',
      travel: '✈️',
      entertainment: '🎬',
      shopping: '🛍️',
      healthcare: '🏥',
      utilities: '💡',
      rent: '🏠',
      mortgage: '🏠',
      insurance: '🛡️',
      education: '📚',
      subscriptions: '📱',
      salary: '💼',
      income: '💰',
      transfer: '🔄',
    }

    return emojis[lowerCategory] || '💰'
  }

  /**
   * Get emoji for budget status
   */
  private getBudgetStatusEmoji(status: string): string {
    switch (status) {
      case 'on_track':
        return '✅'
      case 'over_budget':
        return '❌'
      case 'under_budget':
        return '💰'
      default:
        return '🤔'
    }
  }

  /**
   * Get emoji for goal status
   */
  private getGoalStatusEmoji(status: string): string {
    switch (status) {
      case 'completed':
        return '🎉'
      case 'on_track':
        return '📈'
      case 'behind':
        return '⚠️'
      default:
        return '🎯'
    }
  }

  /**
   * Get emoji for anomaly severity
   */
  private getAnomalySeverityEmoji(severity: string): string {
    switch (severity) {
      case 'high':
        return '🚨'
      case 'medium':
        return '⚠️'
      case 'low':
        return 'ℹ️'
      default:
        return '🤔'
    }
  }
}
