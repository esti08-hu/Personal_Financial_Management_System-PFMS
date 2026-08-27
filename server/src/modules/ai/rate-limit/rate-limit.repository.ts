import { Injectable } from '@nestjs/common'
import { and, desc, eq, sql } from 'drizzle-orm'
import { databaseSchema } from 'src/database/database-schema'
import { DrizzleService } from 'src/database/drizzle.service'

export interface UpsertRateLimitData {
  userId: string
  date: Date
  geminiCallsUsed?: number
  minuteCallsUsed?: number
  cacheHits?: number
  lastResetAt?: Date
}

export interface IncrementCountersData {
  userId: string
  date: Date
  geminiCallsIncrement?: number
  minuteCallsIncrement?: number
  cacheHitsIncrement?: number
}

export interface RateLimitUsageSnapshot {
  id: number
  userId: string
  date: Date
  geminiCallsUsed: number
  minuteCallsUsed: number
  cacheHits: number
  lastResetAt: Date | null
}

@Injectable()
export class RateLimitRepository {
  constructor(private drizzle: DrizzleService) {}

  /**
   * Upsert daily usage record for a user
   * Creates or updates the record for the specific date
   */
  async upsertDailyUsage(data: UpsertRateLimitData) {
    const dateString = data.date.toISOString().split('T')[0] // YYYY-MM-DD format

    const result = await this.drizzle.db.execute(sql`
      INSERT INTO "RateLimitUsage" ("user_id", "date", "gemini_calls_used", "minute_calls_used", "cache_hits", "last_reset_at")
      VALUES (${data.userId}, ${dateString}, ${data.geminiCallsUsed ?? 0}, ${data.minuteCallsUsed ?? 0}, ${data.cacheHits ?? 0}, ${data.lastResetAt ? data.lastResetAt.toISOString() : null})
      ON CONFLICT ("user_id", "date")
      DO UPDATE SET
        "gemini_calls_used" = EXCLUDED."gemini_calls_used",
        "minute_calls_used" = EXCLUDED."minute_calls_used",
        "cache_hits" = EXCLUDED."cache_hits",
        "last_reset_at" = EXCLUDED."last_reset_at"
      RETURNING *
    `)

    return result.rows[0]
  }

  /**
   * Increment counters for a user's daily usage
   * Atomically increments the specified counters
   */
  async incrementCounters(data: IncrementCountersData) {
    const dateString = data.date.toISOString().split('T')[0] // YYYY-MM-DD format

    const geminiIncrement = data.geminiCallsIncrement ?? 0
    const minuteIncrement = data.minuteCallsIncrement ?? 0
    const cacheIncrement = data.cacheHitsIncrement ?? 0

    const result = await this.drizzle.db.execute(sql`
      INSERT INTO "RateLimitUsage" ("user_id", "date", "gemini_calls_used", "minute_calls_used", "cache_hits")
      VALUES (${data.userId}, ${dateString}, ${geminiIncrement}, ${minuteIncrement}, ${cacheIncrement})
      ON CONFLICT ("user_id", "date")
      DO UPDATE SET
        "gemini_calls_used" = "RateLimitUsage"."gemini_calls_used" + ${geminiIncrement},
        "minute_calls_used" = "RateLimitUsage"."minute_calls_used" + ${minuteIncrement},
        "cache_hits" = "RateLimitUsage"."cache_hits" + ${cacheIncrement}
      RETURNING *
    `)

    return result.rows[0]
  }

  /**
   * Get usage snapshot for a user on a specific date
   */
  async getUsageSnapshot(
    userId: string,
    date: Date,
  ): Promise<RateLimitUsageSnapshot | null> {
    const dateString = date.toISOString().split('T')[0] // YYYY-MM-DD format

    const result = await this.drizzle.db.execute(sql`
      SELECT * FROM "RateLimitUsage"
      WHERE "user_id" = ${userId} AND "date" = ${dateString}
    `)

    return result.rows[0] || null
  }

  /**
   * Get usage snapshot for today
   */
  async getTodayUsageSnapshot(
    userId: string,
  ): Promise<RateLimitUsageSnapshot | null> {
    const today = new Date()
    return this.getUsageSnapshot(userId, today)
  }

  /**
   * Get usage history for a user over a date range
   */
  async getUsageHistory(userId: string, startDate: Date, endDate: Date) {
    const startDateString = startDate.toISOString().split('T')[0]
    const endDateString = endDate.toISOString().split('T')[0]

    const result = await this.drizzle.db.execute(sql`
      SELECT * FROM "RateLimitUsage"
      WHERE "user_id" = ${userId}
        AND "date" >= ${startDateString}
        AND "date" <= ${endDateString}
      ORDER BY "date" DESC
    `)

    return result.rows
  }

  /**
   * Reset usage counters for a user on a specific date
   */
  async resetUsage(userId: string, date: Date) {
    const dateString = date.toISOString().split('T')[0]

    const result = await this.drizzle.db.execute(sql`
      UPDATE "RateLimitUsage"
      SET "gemini_calls_used" = 0, "minute_calls_used" = 0, "cache_hits" = 0, "last_reset_at" = ${new Date().toISOString()}
      WHERE "user_id" = ${userId} AND "date" = ${dateString}
      RETURNING *
    `)

    return result.rows[0] || null
  }

  /**
   * Get total usage statistics for a user across all dates
   */
  async getTotalUsageStats(userId: string) {
    const result = await this.drizzle.db.execute(sql`
      SELECT
        COALESCE(SUM("gemini_calls_used"), 0) as total_gemini_calls,
        COALESCE(SUM("minute_calls_used"), 0) as total_minute_calls,
        COALESCE(SUM("cache_hits"), 0) as total_cache_hits,
        COUNT(*) as days_with_usage
      FROM "RateLimitUsage"
      WHERE "user_id" = ${userId}
    `)

    return (
      result.rows[0] || {
        total_gemini_calls: 0,
        total_minute_calls: 0,
        total_cache_hits: 0,
        days_with_usage: 0,
      }
    )
  }

  /**
   * Clean up old usage records (older than specified days)
   */
  async cleanupOldRecords(olderThanDays: number) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)
    const cutoffDateString = cutoffDate.toISOString().split('T')[0]

    const result = await this.drizzle.db.execute(sql`
      DELETE FROM "RateLimitUsage"
      WHERE "date" < ${cutoffDateString}
    `)

    return result.rowCount
  }

  /**
   * Check if user has exceeded daily limits
   */
  async checkDailyLimits(
    userId: string,
    date: Date,
    geminiLimit: number,
    minuteLimit: number,
  ) {
    const snapshot = await this.getUsageSnapshot(userId, date)

    if (!snapshot) {
      return { exceeded: false, geminiCallsUsed: 0, minuteCallsUsed: 0 }
    }

    const exceeded =
      snapshot.geminiCallsUsed >= geminiLimit ||
      snapshot.minuteCallsUsed >= minuteLimit

    return {
      exceeded,
      geminiCallsUsed: snapshot.geminiCallsUsed,
      minuteCallsUsed: snapshot.minuteCallsUsed,
      geminiLimit,
      minuteLimit,
    }
  }
}
