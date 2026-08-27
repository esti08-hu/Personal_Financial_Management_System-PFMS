import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RateLimitRepository } from './rate-limit.repository'

export interface SlidingWindowConfig {
  windowSizeMs: number // Size of the sliding window in milliseconds
  maxRequests: number // Maximum requests allowed in the window
  bucketCount: number // Number of buckets to divide the window into
}

export interface RateLimitResult {
  allowed: boolean
  remainingRequests: number
  resetTime: Date
  retryAfter?: number // Seconds to wait before retrying
}

export interface RateLimitStatus {
  currentRequests: number
  maxRequests: number
  windowStart: Date
  windowEnd: Date
  resetTime: Date
}

export interface RateLimitOptions {
  windowSizeMs?: number
  maxRequests?: number
  bucketCount?: number
}

/**
 * Sliding Window Rate Limiter
 * Uses a sliding window algorithm to track requests over rolling time periods
 */
@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name)
  private readonly defaultConfig: SlidingWindowConfig

  // In-memory storage for sliding window buckets
  // In production, this should be replaced with Redis or similar
  private buckets = new Map<string, Map<number, number>>()

  constructor(
    private configService: ConfigService,
    private rateLimitRepository: RateLimitRepository,
  ) {
    this.defaultConfig = {
      windowSizeMs: this.configService.get('RATE_LIMIT_WINDOW_MS', 60000), // 1 minute default
      maxRequests: this.configService.get('RATE_LIMIT_MAX_REQUESTS', 60), // 60 requests per minute default
      bucketCount: this.configService.get('RATE_LIMIT_BUCKET_COUNT', 10), // 10 buckets
    }

    // Start cleanup interval
    setInterval(() => this.cleanupExpiredBuckets(), 30000) // Clean up every 30 seconds
  }

  /**
   * Check if a request is allowed under the rate limit
   */
  async checkLimit(
    userId: string,
    action: string = 'default',
    options: RateLimitOptions = {},
  ): Promise<RateLimitResult> {
    const config = this.getConfig(options)
    const key = this.getKey(userId, action)
    const now = Date.now()
    const windowStart = now - config.windowSizeMs

    // Get or create bucket map for this key
    const bucketMap = this.getBucketMap(key)

    // Remove expired buckets
    this.cleanupBuckets(bucketMap, windowStart, config)

    // Count requests in current window
    let totalRequests = 0
    for (const count of bucketMap.values()) {
      totalRequests += count
    }

    const allowed = totalRequests < config.maxRequests
    const remainingRequests = Math.max(
      0,
      config.maxRequests - totalRequests - (allowed ? 1 : 0),
    )
    const resetTime = new Date(now + config.windowSizeMs)

    if (allowed) {
      // Add request to current bucket
      this.addToBucket(bucketMap, now, config)

      // Also update database for daily tracking
      await this.updateDailyUsage(userId, action)
    }

    return {
      allowed,
      remainingRequests,
      resetTime,
      retryAfter: allowed ? undefined : Math.ceil(config.windowSizeMs / 1000),
    }
  }

  /**
   * Get current rate limit status
   */
  async getStatus(
    userId: string,
    action: string = 'default',
    options: RateLimitOptions = {},
  ): Promise<RateLimitStatus> {
    const config = this.getConfig(options)
    const key = this.getKey(userId, action)
    const now = Date.now()
    const windowStart = now - config.windowSizeMs

    const bucketMap = this.getBucketMap(key)
    this.cleanupBuckets(bucketMap, windowStart, config)

    let currentRequests = 0
    for (const count of bucketMap.values()) {
      currentRequests += count
    }

    return {
      currentRequests,
      maxRequests: config.maxRequests,
      windowStart: new Date(windowStart),
      windowEnd: new Date(now),
      resetTime: new Date(now + config.windowSizeMs),
    }
  }

  /**
   * Reset rate limit for a user/action
   */
  async resetLimit(userId: string, action: string = 'default'): Promise<void> {
    const key = this.getKey(userId, action)
    this.buckets.delete(key)
    this.logger.debug(`Reset rate limit for user ${userId}, action ${action}`)
  }

  /**
   * Get rate limit configuration with defaults
   */
  private getConfig(options: RateLimitOptions): SlidingWindowConfig {
    return {
      windowSizeMs: options.windowSizeMs || this.defaultConfig.windowSizeMs,
      maxRequests: options.maxRequests || this.defaultConfig.maxRequests,
      bucketCount: options.bucketCount || this.defaultConfig.bucketCount,
    }
  }

  /**
   * Generate cache key for user and action
   */
  private getKey(userId: string, action: string): string {
    return `ratelimit:${userId}:${action}`
  }

  /**
   * Get or create bucket map for a key
   */
  private getBucketMap(key: string): Map<number, number> {
    if (!this.buckets.has(key)) {
      this.buckets.set(key, new Map())
    }
    return this.buckets.get(key)!
  }

  /**
   * Add request to appropriate bucket
   */
  private addToBucket(
    bucketMap: Map<number, number>,
    timestamp: number,
    config: SlidingWindowConfig,
  ): void {
    const bucketSize = config.windowSizeMs / config.bucketCount
    const bucketIndex = Math.floor(timestamp / bucketSize)

    const currentCount = bucketMap.get(bucketIndex) || 0
    bucketMap.set(bucketIndex, currentCount + 1)
  }

  /**
   * Remove expired buckets from the map
   */
  private cleanupBuckets(
    bucketMap: Map<number, number>,
    windowStart: number,
    config: SlidingWindowConfig,
  ): void {
    const bucketSize = config.windowSizeMs / config.bucketCount
    const expiredBuckets: number[] = []

    for (const [bucketIndex] of bucketMap) {
      const bucketStart = bucketIndex * bucketSize
      if (bucketStart < windowStart) {
        expiredBuckets.push(bucketIndex)
      }
    }

    for (const bucketIndex of expiredBuckets) {
      bucketMap.delete(bucketIndex)
    }
  }

  /**
   * Clean up expired buckets across all keys
   */
  private cleanupExpiredBuckets(): void {
    const now = Date.now()
    const windowStart = now - this.defaultConfig.windowSizeMs

    for (const [key, bucketMap] of this.buckets.entries()) {
      this.cleanupBuckets(bucketMap, windowStart, this.defaultConfig)

      // Remove empty bucket maps
      if (bucketMap.size === 0) {
        this.buckets.delete(key)
      }
    }
  }

  /**
   * Update daily usage in database for reporting
   */
  private async updateDailyUsage(
    userId: string,
    action: string,
  ): Promise<void> {
    try {
      const today = new Date()

      // Different actions map to different counters
      const incrementData: any = {
        userId,
        date: today,
      }

      switch (action) {
        case 'gemini':
          incrementData.geminiCallsIncrement = 1
          break
        case 'minute':
          incrementData.minuteCallsIncrement = 1
          break
        case 'cache':
          incrementData.cacheHitsIncrement = 1
          break
        default:
          // For general actions, increment minute calls
          incrementData.minuteCallsIncrement = 1
          break
      }

      await this.rateLimitRepository.incrementCounters(incrementData)
    } catch (error) {
      // Log error but don't fail the rate limit check
      this.logger.warn(
        `Failed to update daily usage for user ${userId}:`,
        error,
      )
    }
  }

  /**
   * Check daily limits (complementary to sliding window)
   */
  async checkDailyLimit(
    userId: string,
    action: string,
    dailyLimit: number,
  ): Promise<{ allowed: boolean; used: number; remaining: number }> {
    try {
      const today = new Date()
      const snapshot = await this.rateLimitRepository.getUsageSnapshot(
        userId,
        today,
      )

      let used = 0
      switch (action) {
        case 'gemini':
          used = snapshot?.geminiCallsUsed || 0
          break
        case 'minute':
          used = snapshot?.minuteCallsUsed || 0
          break
        case 'cache':
          used = snapshot?.cacheHits || 0
          break
        default:
          used = snapshot?.minuteCallsUsed || 0
          break
      }

      const allowed = used < dailyLimit
      const remaining = Math.max(0, dailyLimit - used)

      return { allowed, used, remaining }
    } catch (error) {
      this.logger.warn(`Failed to check daily limit for user ${userId}:`, error)
      // Allow request if database check fails
      return { allowed: true, used: 0, remaining: dailyLimit }
    }
  }

  /**
   * Combined check: both sliding window and daily limits
   */
  async checkCombinedLimit(
    userId: string,
    action: string = 'default',
    windowOptions: RateLimitOptions = {},
    dailyLimit?: number,
  ): Promise<
    RateLimitResult & { dailyUsed?: number; dailyRemaining?: number }
  > {
    // Check sliding window limit
    const windowResult = await this.checkLimit(userId, action, windowOptions)

    if (!windowResult.allowed) {
      return windowResult
    }

    // If daily limit is specified, also check it
    if (dailyLimit !== undefined) {
      const dailyResult = await this.checkDailyLimit(userId, action, dailyLimit)

      if (!dailyResult.allowed) {
        return {
          allowed: false,
          remainingRequests: 0,
          resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          retryAfter: 24 * 60 * 60, // 24 hours in seconds
          dailyUsed: dailyResult.used,
          dailyRemaining: dailyResult.remaining,
        }
      }

      return {
        ...windowResult,
        dailyUsed: dailyResult.used,
        dailyRemaining: dailyResult.remaining,
      }
    }

    return windowResult
  }

  /**
   * Get rate limit statistics
   */
  getStats() {
    const totalKeys = this.buckets.size
    let totalBuckets = 0
    let totalRequests = 0

    for (const bucketMap of this.buckets.values()) {
      totalBuckets += bucketMap.size
      for (const count of bucketMap.values()) {
        totalRequests += count
      }
    }

    return {
      totalKeys,
      totalBuckets,
      totalRequests,
      averageBucketsPerKey: totalKeys > 0 ? totalBuckets / totalKeys : 0,
      averageRequestsPerBucket:
        totalBuckets > 0 ? totalRequests / totalBuckets : 0,
      config: this.defaultConfig,
    }
  }
}
