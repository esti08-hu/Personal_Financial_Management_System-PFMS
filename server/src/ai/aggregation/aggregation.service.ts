import { Injectable } from '@nestjs/common'
import { and, eq, gte, lte, sql, sum, desc } from 'drizzle-orm'
import { databaseSchema } from '../../database/database-schema'
import { DrizzleService } from '../../database/drizzle.service'
import { AnomalyDetection, AnomalyDetectionService } from '../anomaly'
import { Timeframe } from '../intent/intent.parser'

export interface CategoryBreakdown {
  category: string
  amount: number
  transactionCount: number
  percentage: number
}

export interface PeriodComparison {
  current: {
    total: number
    transactionCount: number
  }
  previous: {
    total: number
    transactionCount: number
  }
  change: {
    amount: number
    percentage: number
  }
}

export interface TransactionDetail {
  id: string
  type: string
  amount: number
  description?: string
  createdAt: Date
  accountId: string
}

export interface AggregationResult {
  totalIncome: number
  totalExpenses: number
  netAmount: number
  transactionCount: number
  categoryBreakdown: CategoryBreakdown[]
  periodComparison?: PeriodComparison
  anomalyDetection?: AnomalyDetection
  recentTransactions?: TransactionDetail[]
}

@Injectable()
export class AggregationService {
  constructor(
    private drizzle: DrizzleService,
    private anomalyDetectionService: AnomalyDetectionService,
  ) {}

  /**
   * Aggregate financial data for a user within a timeframe
   */
  async aggregateFinancialData(
    userId: string,
    timeframe?: Timeframe,
    categories?: string[],
  ): Promise<AggregationResult> {
    const dateFilter = timeframe
      ? {
          gte: timeframe.start,
          lte: timeframe.end,
        }
      : undefined

    // Get total income
    const incomeResult = await this.getTotalAmount(
      userId,
      'Deposit',
      dateFilter,
    )

    // Get total expenses
    const expenseResult = await this.getTotalAmount(
      userId,
      ['Withdrawal', 'Transfer'],
      dateFilter,
    )

    // Get transaction count
    const transactionCount = await this.getTransactionCount(userId, dateFilter)

    // Get category breakdown
    const categoryBreakdown = await this.getCategoryBreakdown(
      userId,
      dateFilter,
      categories,
    )

    // Get recent transactions
    const recentTransactions = await this.getRecentTransactions(
      userId,
      5, // Get last 5 transactions
      timeframe
    )

    const result: AggregationResult = {
      totalIncome: incomeResult.total,
      totalExpenses: expenseResult.total,
      netAmount: incomeResult.total - expenseResult.total,
      transactionCount,
      categoryBreakdown,
      recentTransactions,
    }

    // Add period comparison if timeframe is provided
    if (timeframe) {
      result.periodComparison = await this.getPeriodComparison(
        userId,
        timeframe,
      )
    }

    // Add anomaly detection
    result.anomalyDetection =
      await this.anomalyDetectionService.detectAnomalies(
        userId,
        result.totalExpenses,
        timeframe,
      )
      console.log("asdfasdf")
    return result
  }

  /**
   * Get total amount for specific transaction types
   */
  private async getTotalAmount(
    userId: string,
    types: string | string[],
    dateFilter?: { gte: Date; lte: Date },
  ): Promise<{ total: number }> {
    let typeCondition

    if (Array.isArray(types)) {
      typeCondition = sql`${databaseSchema.transaction.type} IN (${sql.join(
        types.map((t) => sql`${t}`),
        sql`, `,
      )})`
    } else {
      typeCondition = eq(databaseSchema.transaction.type, types)
    }

    const conditions = [
      eq(databaseSchema.transaction.userId, userId),
      typeCondition,
    ]

    if (dateFilter) {
      conditions.push(gte(databaseSchema.transaction.createdAt, dateFilter.gte))
      conditions.push(lte(databaseSchema.transaction.createdAt, dateFilter.lte))
    }

    const result = await this.drizzle.db
      .select({ total: sum(databaseSchema.transaction.amount) })
      .from(databaseSchema.transaction)
      .where(and(...conditions))

    return { total: Number(result[0]?.total) || 0 }
  }

  /**
   * Get transaction count
   */
  private async getTransactionCount(
    userId: string,
    dateFilter?: { gte: Date; lte: Date },
  ): Promise<number> {
    const conditions = [eq(databaseSchema.transaction.userId, userId)]

    if (dateFilter) {
      conditions.push(gte(databaseSchema.transaction.createdAt, dateFilter.gte))
      conditions.push(lte(databaseSchema.transaction.createdAt, dateFilter.lte))
    }

    const result = await this.drizzle.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(databaseSchema.transaction)
      .where(and(...conditions))

    return result[0]?.count || 0
  }

  /**
   * Get category breakdown based on transaction descriptions
   * This is a simplified implementation - in a real system you'd have proper categories
   */
  private async getCategoryBreakdown(
    userId: string,
    dateFilter?: { gte: Date; lte: Date },
    filterCategories?: string[],
  ): Promise<CategoryBreakdown[]> {
    const conditions = [
      eq(databaseSchema.transaction.userId, userId),
      sql`${databaseSchema.transaction.type} IN ('Withdrawal', 'Transfer')`, // Only expenses
    ]

    if (dateFilter) {
      conditions.push(gte(databaseSchema.transaction.createdAt, dateFilter.gte))
      conditions.push(lte(databaseSchema.transaction.createdAt, dateFilter.lte))
    }

    // Group by type as a simple category proxy
    const result = await this.drizzle.db
      .select({
        category: databaseSchema.transaction.type,
        totalAmount: sum(databaseSchema.transaction.amount),
        transactionCount: sql<number>`COUNT(*)`,
      })
      .from(databaseSchema.transaction)
      .where(and(...conditions))
      .groupBy(databaseSchema.transaction.type)

    const totalExpenses = result.reduce(
      (sum, item) => sum + Number(item.totalAmount),
      0,
    )

    return result
      .filter(
        (item) => !filterCategories || filterCategories.includes(item.category),
      )
      .map((item) => ({
        category: item.category,
        amount: Number(item.totalAmount),
        transactionCount: item.transactionCount,
        percentage:
          totalExpenses > 0
            ? (Number(item.totalAmount) / totalExpenses) * 100
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
  }

  /**
   * Compare current period with previous period
   */
  private async getPeriodComparison(
    userId: string,
    currentTimeframe: Timeframe,
  ): Promise<PeriodComparison> {
    const periodLength =
      currentTimeframe.end.getTime() - currentTimeframe.start.getTime()

    // Calculate previous period
    const previousEnd = new Date(currentTimeframe.start.getTime() - 1)
    const previousStart = new Date(previousEnd.getTime() - periodLength)

    // Get current period data
    const currentIncome = await this.getTotalAmount(userId, 'Deposit', {
      gte: currentTimeframe.start,
      lte: currentTimeframe.end,
    })
    const currentExpenses = await this.getTotalAmount(
      userId,
      ['Withdrawal', 'Transfer'],
      {
        gte: currentTimeframe.start,
        lte: currentTimeframe.end,
      },
    )
    const currentCount = await this.getTransactionCount(userId, {
      gte: currentTimeframe.start,
      lte: currentTimeframe.end,
    })

    // Get previous period data
    const previousIncome = await this.getTotalAmount(userId, 'Deposit', {
      gte: previousStart,
      lte: previousEnd,
    })
    const previousExpenses = await this.getTotalAmount(
      userId,
      ['Withdrawal', 'Transfer'],
      {
        gte: previousStart,
        lte: previousEnd,
      },
    )
    const previousCount = await this.getTransactionCount(userId, {
      gte: previousStart,
      lte: previousEnd,
    })

    const currentTotal = currentIncome.total - currentExpenses.total
    const previousTotal = previousIncome.total - previousExpenses.total

    const amountChange = currentTotal - previousTotal
    const percentageChange =
      previousTotal !== 0 ? (amountChange / Math.abs(previousTotal)) * 100 : 0

    return {
      current: {
        total: currentTotal,
        transactionCount: currentCount,
      },
      previous: {
        total: previousTotal,
        transactionCount: previousCount,
      },
      change: {
        amount: amountChange,
        percentage: percentageChange,
      },
    }
  }

  /**
   * Get recent transactions for a user
   */
  async getRecentTransactions(
    userId: string,
    limit: number = 10,
    timeframe?: Timeframe,
    categories?: string[],
  ): Promise<TransactionDetail[]> {
    const conditions = [eq(databaseSchema.transaction.userId, userId)]

    if (timeframe) {
      conditions.push(gte(databaseSchema.transaction.createdAt, timeframe.start))
      conditions.push(lte(databaseSchema.transaction.createdAt, timeframe.end))
    }

    if (categories && categories.length > 0) {
      conditions.push(sql`${databaseSchema.transaction.type} IN (${sql.join(
        categories.map((c) => sql`${c}`),
        sql`, `,
      )})`)
    }

    const result = await this.drizzle.db
      .select({
        id: databaseSchema.transaction.id,
        type: databaseSchema.transaction.type,
        amount: databaseSchema.transaction.amount,
        description: databaseSchema.transaction.description,
        createdAt: databaseSchema.transaction.createdAt,
        accountId: databaseSchema.transaction.accountId,
      })
      .from(databaseSchema.transaction)
      .where(and(...conditions))
      .orderBy(desc(databaseSchema.transaction.createdAt))
      .limit(limit)

    return result.map((row) => ({
      id: row.id,
      type: row.type,
      amount: Number(row.amount),
      description: row.description || undefined,
      createdAt: row.createdAt!,
      accountId: row.accountId,
    }))
  }
}
