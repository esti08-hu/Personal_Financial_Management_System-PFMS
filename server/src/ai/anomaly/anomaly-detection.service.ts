import { Injectable } from '@nestjs/common'
import { and, sql } from 'drizzle-orm'
import { databaseSchema } from '../../database/database-schema'
import { DrizzleService } from '../../database/drizzle.service'
import { Timeframe } from '../intent/intent.parser'

export interface AnomalyDetection {
  isAnomaly: boolean
  score: number
  threshold: number
  reason?: string
}

export interface AnomalyThreshold {
  rateLimitMultiplier: number
  anomalyScoreThreshold: number
  consecutiveFailuresThreshold: number
}

@Injectable()
export class AnomalyDetectionService {
  constructor(private readonly drizzle: DrizzleService) {}

  /**
   * Detect anomalies in financial data using configurable thresholds
   */
  async detectAnomalies(
    userId: string,
    currentExpenses: number,
    timeframe?: Timeframe,
  ): Promise<AnomalyDetection> {
    const threshold = await this.getAnomalyThreshold()

    // Calculate baseline (average expenses over a longer period)
    const baselinePeriod = timeframe
      ? this.getBaselinePeriod(timeframe)
      : this.getDefaultBaselinePeriod()

    const baselineExpenses = await this.getTotalAmount(
      userId,
      ['Withdrawal', 'Transfer'],
      baselinePeriod,
    )

    const baselineTransactionCount = await this.getTransactionCount(
      userId,
      baselinePeriod,
    )

    // Calculate average expense per transaction
    const avgExpensePerTransaction =
      baselineTransactionCount > 0
        ? baselineExpenses.total / baselineTransactionCount
        : 0

    // Simple anomaly detection: check if current expenses exceed baseline by multiplier
    const expectedMaxExpenses =
      avgExpensePerTransaction *
      threshold.rateLimitMultiplier *
      (timeframe ? this.getTimeframeMultiplier(timeframe) : 1)

    let score = 0
    let reason = ''

    if (currentExpenses > expectedMaxExpenses) {
      score =
        (currentExpenses / expectedMaxExpenses) *
        threshold.anomalyScoreThreshold
      reason = `Expenses (${currentExpenses}) exceed expected maximum (${expectedMaxExpenses.toFixed(2)})`
    }

    return {
      isAnomaly: score > threshold.anomalyScoreThreshold,
      score,
      threshold: threshold.anomalyScoreThreshold,
      reason: score > threshold.anomalyScoreThreshold ? reason : undefined,
    }
  }

  /**
   * Get anomaly threshold configuration from database
   */
  private async getAnomalyThreshold(): Promise<AnomalyThreshold> {
    const thresholdResult = await this.drizzle.db
      .select()
      .from(databaseSchema.anomalyThreshold)
      .limit(1)
      .orderBy(sql`${databaseSchema.anomalyThreshold.id} DESC`)

    return (
      thresholdResult[0] || {
        rateLimitMultiplier: 2,
        anomalyScoreThreshold: 10,
        consecutiveFailuresThreshold: 5,
      }
    )
  }

  /**
   * Get total amount for transaction types within a date range
   */
  private async getTotalAmount(
    userId: string,
    types: string | string[],
    dateFilter?: { gte: Date; lte: Date },
  ): Promise<{ total: number }> {
    const typeArray = Array.isArray(types) ? types : [types]
    const conditions = [sql`${databaseSchema.transaction.userId} = ${userId}`]

    if (dateFilter) {
      conditions.push(
        sql`${databaseSchema.transaction.createdAt} >= ${dateFilter.gte}`,
        sql`${databaseSchema.transaction.createdAt} <= ${dateFilter.lte}`,
      )
    }

    const result = await this.drizzle.db
      .select({
        total: sql<number>`SUM(${databaseSchema.transaction.amount})`,
      })
      .from(databaseSchema.transaction)
      .where(and(...conditions))

    return { total: Number(result[0]?.total) || 0 }
  }

  /**
   * Get transaction count within a date range
   */
  private async getTransactionCount(
    userId: string,
    dateFilter?: { gte: Date; lte: Date },
  ): Promise<number> {
    const conditions = [sql`${databaseSchema.transaction.userId} = ${userId}`]

    if (dateFilter) {
      conditions.push(
        sql`${databaseSchema.transaction.createdAt} >= ${dateFilter.gte}`,
        sql`${databaseSchema.transaction.createdAt} <= ${dateFilter.lte}`,
      )
    }

    const result = await this.drizzle.db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(databaseSchema.transaction)
      .where(and(...conditions))

    return Number(result[0]?.count) || 0
  }

  /**
   * Get baseline period for anomaly detection (longer period before current timeframe)
   */
  private getBaselinePeriod(timeframe: Timeframe): { gte: Date; lte: Date } {
    const periodLength = timeframe.end.getTime() - timeframe.start.getTime()
    const baselineEnd = new Date(timeframe.start.getTime() - 1)
    const baselineStart = new Date(baselineEnd.getTime() - periodLength * 4) // 4x the period length

    return { gte: baselineStart, lte: baselineEnd }
  }

  /**
   * Get default baseline period (last 90 days)
   */
  private getDefaultBaselinePeriod(): { gte: Date; lte: Date } {
    const end = new Date()
    const start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000) // 90 days ago

    return { gte: start, lte: end }
  }

  /**
   * Get multiplier based on timeframe length (shorter periods have higher variance)
   */
  private getTimeframeMultiplier(timeframe: Timeframe): number {
    const periodLength = timeframe.end.getTime() - timeframe.start.getTime()
    const days = periodLength / (24 * 60 * 60 * 1000)

    // Shorter periods allow more variance
    if (days <= 1) return 3 // Daily
    if (days <= 7) return 2 // Weekly
    if (days <= 30) return 1.5 // Monthly
    return 1 // Longer periods
  }
}
