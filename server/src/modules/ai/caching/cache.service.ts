import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export interface CacheEntry<T = any> {
  key: string
  value: T
  ttl?: number // Time to live in milliseconds
  createdAt: Date
  lastAccessedAt: Date
  accessCount: number
}

export interface CacheOptions {
  ttl?: number // Default TTL for entries
  maxSize?: number // Maximum number of entries
  enableCompression?: boolean
}

export interface NormalizedData {
  original: any
  normalized: any
  schema: string // Schema identifier for the data type
  version: string // Normalization version
  metadata: Record<string, any>
}

/**
 * Data normalization utility for consistent formatting
 */
export class DataNormalizer {
  private static readonly SCHEMAS = {
    FINANCIAL_DATA: 'financial_data',
    USER_PROFILE: 'user_profile',
    TRANSACTION: 'transaction',
    ANALYTICS: 'analytics',
    CONVERSATION: 'conversation',
  }

  private static readonly VERSIONS = {
    V1: '1.0.0',
    V2: '2.0.0',
  }

  /**
   * Normalize financial data for consistent caching
   */
  static normalizeFinancialData(data: any): NormalizedData {
    const normalized = {
      totalIncome: Number(data.totalIncome) || 0,
      totalExpenses: Number(data.totalExpenses) || 0,
      netIncome: Number(data.netIncome) || 0,
      categories: Array.isArray(data.categories)
        ? data.categories.map((cat) => ({
            name: String(cat.name || ''),
            amount: Number(cat.amount) || 0,
            percentage: Number(cat.percentage) || 0,
            transactionCount: Number(cat.transactionCount) || 0,
          }))
        : [],
      timeframe: data.timeframe
        ? {
            start: new Date(data.timeframe.start),
            end: new Date(data.timeframe.end),
            label: String(data.timeframe.label || ''),
          }
        : null,
      anomalyDetected: Boolean(data.anomalyDetected),
      anomalyScore: Number(data.anomalyScore) || 0,
    }

    return {
      original: data,
      normalized,
      schema: this.SCHEMAS.FINANCIAL_DATA,
      version: this.VERSIONS.V1,
      metadata: {
        hasCategories: normalized.categories.length > 0,
        hasTimeframe: normalized.timeframe !== null,
        totalCategories: normalized.categories.length,
      },
    }
  }

  /**
   * Normalize user profile data
   */
  static normalizeUserProfile(data: any): NormalizedData {
    const normalized = {
      id: Number(data.id),
      email: String(data.email || '')
        .toLowerCase()
        .trim(),
      firstName: String(data.firstName || '').trim(),
      lastName: String(data.lastName || '').trim(),
      preferences: {
        currency: String(data.preferences?.currency || 'USD'),
        timezone: String(data.preferences?.timezone || 'UTC'),
        notifications: Boolean(data.preferences?.notifications ?? true),
        theme: String(data.preferences?.theme || 'light'),
      },
      createdAt: new Date(data.createdAt),
      lastLoginAt: data.lastLoginAt ? new Date(data.lastLoginAt) : null,
    }

    return {
      original: data,
      normalized,
      schema: this.SCHEMAS.USER_PROFILE,
      version: this.VERSIONS.V1,
      metadata: {
        hasLastLogin: normalized.lastLoginAt !== null,
        accountAge: Date.now() - normalized.createdAt.getTime(),
      },
    }
  }

  /**
   * Normalize transaction data
   */
  static normalizeTransaction(data: any): NormalizedData {
    const normalized = {
      id: Number(data.id),
      userId: data.userId,
      amount: Number(data.amount),
      type: String(data.type || 'expense').toLowerCase(),
      category: String(data.category || 'uncategorized').toLowerCase(),
      description: String(data.description || '').trim(),
      date: new Date(data.date || data.createdAt),
      tags: Array.isArray(data.tags)
        ? data.tags.map((tag) => String(tag).toLowerCase().trim())
        : [],
      metadata: data.metadata || {},
    }

    return {
      original: data,
      normalized,
      schema: this.SCHEMAS.TRANSACTION,
      version: this.VERSIONS.V1,
      metadata: {
        hasTags: normalized.tags.length > 0,
        hasMetadata: Object.keys(normalized.metadata).length > 0,
        amountRange: normalized.amount > 0 ? 'positive' : 'negative',
      },
    }
  }

  /**
   * Normalize analytics data
   */
  static normalizeAnalytics(data: any): NormalizedData {
    const normalized = {
      userId: data.userId,
      period: {
        start: new Date(data.period?.start || data.startDate),
        end: new Date(data.period?.end || data.endDate),
        label: String(data.period?.label || data.label || ''),
      },
      metrics: {
        totalTransactions: Number(
          data.metrics?.totalTransactions || data.totalTransactions || 0,
        ),
        totalVolume: Number(data.metrics?.totalVolume || data.totalVolume || 0),
        averageTransaction: Number(
          data.metrics?.averageTransaction || data.averageTransaction || 0,
        ),
        topCategories: Array.isArray(
          data.metrics?.topCategories || data.topCategories,
        )
          ? (data.metrics?.topCategories || data.topCategories).map((cat) => ({
              name: String(cat.name || ''),
              amount: Number(cat.amount || 0),
              percentage: Number(cat.percentage || 0),
            }))
          : [],
      },
      trends: data.trends || {},
    }

    return {
      original: data,
      normalized,
      schema: this.SCHEMAS.ANALYTICS,
      version: this.VERSIONS.V1,
      metadata: {
        hasTrends: Object.keys(normalized.trends).length > 0,
        topCategoriesCount: normalized.metrics.topCategories.length,
        periodDays: Math.ceil(
          (normalized.period.end.getTime() -
            normalized.period.start.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      },
    }
  }

  /**
   * Normalize conversation data
   */
  static normalizeConversation(data: any): NormalizedData {
    const normalized = {
      id: String(data.id || data.conversationId),
      userId: data.userId,
      messages: Array.isArray(data.messages)
        ? data.messages.map((msg) => ({
            role: String(msg.role || 'user').toLowerCase(),
            content: String(msg.content || '').trim(),
            timestamp: new Date(msg.timestamp || msg.createdAt || Date.now()),
            metadata: msg.metadata || {},
          }))
        : [],
      context: data.context || {},
      createdAt: new Date(data.createdAt || Date.now()),
      updatedAt: new Date(data.updatedAt || data.createdAt || Date.now()),
    }

    return {
      original: data,
      normalized,
      schema: this.SCHEMAS.CONVERSATION,
      version: this.VERSIONS.V1,
      metadata: {
        messageCount: normalized.messages.length,
        hasContext: Object.keys(normalized.context).length > 0,
        lastMessageAt:
          normalized.messages.length > 0
            ? normalized.messages[normalized.messages.length - 1].timestamp
            : null,
      },
    }
  }

  /**
   * Generic normalization with schema detection
   */
  static normalize(data: any, schema?: string): NormalizedData {
    if (schema) {
      switch (schema) {
        case this.SCHEMAS.FINANCIAL_DATA:
          return this.normalizeFinancialData(data)
        case this.SCHEMAS.USER_PROFILE:
          return this.normalizeUserProfile(data)
        case this.SCHEMAS.TRANSACTION:
          return this.normalizeTransaction(data)
        case this.SCHEMAS.ANALYTICS:
          return this.normalizeAnalytics(data)
        case this.SCHEMAS.CONVERSATION:
          return this.normalizeConversation(data)
        default:
          throw new Error(`Unknown schema: ${schema}`)
      }
    }

    // Auto-detect schema based on data structure
    if (data.totalIncome !== undefined || data.totalExpenses !== undefined) {
      return this.normalizeFinancialData(data)
    }
    if (data.email && data.firstName !== undefined) {
      return this.normalizeUserProfile(data)
    }
    if (data.amount && data.type && ['income', 'expense'].includes(data.type)) {
      return this.normalizeTransaction(data)
    }
    if (data.metrics || data.period) {
      return this.normalizeAnalytics(data)
    }
    if (data.messages || data.conversationId) {
      return this.normalizeConversation(data)
    }

    // Default to conversation if nothing matches
    return this.normalizeConversation(data)
  }
}

/**
 * LRU Cache Service with normalization support
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name)
  private cache = new Map<string, CacheEntry>()
  private readonly options: Required<CacheOptions>

  constructor(private configService: ConfigService) {
    this.options = {
      ttl: this.configService.get('CACHE_TTL', 3600000), // 1 hour default
      maxSize: this.configService.get('CACHE_MAX_SIZE', 1000),
      enableCompression: this.configService.get('CACHE_COMPRESSION', false),
    }

    // Start cleanup interval
    setInterval(() => this.cleanup(), 60000) // Clean up every minute
  }

  /**
   * Get cached value with normalization
   */
  async get<T = any>(
    key: string,
    normalize: boolean = true,
  ): Promise<T | null> {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check TTL
    if (this.isExpired(entry)) {
      this.cache.delete(key)
      return null
    }

    // Update access statistics
    entry.lastAccessedAt = new Date()
    entry.accessCount++

    // Return normalized data if requested
    if (
      normalize &&
      entry.value &&
      typeof entry.value === 'object' &&
      'normalized' in entry.value
    ) {
      return (entry.value as NormalizedData).normalized as T
    }

    return entry.value as T
  }

  /**
   * Set cached value with optional normalization
   */
  async set<T = any>(
    key: string,
    value: T,
    options: { ttl?: number; normalize?: boolean; schema?: string } = {},
  ): Promise<void> {
    const { ttl = this.options.ttl, normalize = false, schema } = options

    let processedValue = value

    // Normalize data if requested
    if (normalize && value) {
      try {
        processedValue = DataNormalizer.normalize(value, schema) as T
        this.logger.debug(
          `Normalized data for key: ${key}, schema: ${schema || 'auto-detected'}`,
        )
      } catch (error) {
        this.logger.warn(`Failed to normalize data for key: ${key}`, error)
      }
    }

    // Check cache size limit - evict before adding if at capacity
    if (this.cache.size >= this.options.maxSize) {
      this.evictLRU()
    }

    const entry: CacheEntry = {
      key,
      value: processedValue,
      ttl,
      createdAt: new Date(),
      lastAccessedAt: new Date(),
      accessCount: 0,
    }

    this.cache.set(key, entry)
  }

  /**
   * Delete cached value
   */
  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key)
  }

  /**
   * Clear all cached values
   */
  async clear(): Promise<void> {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const entries = Array.from(this.cache.values())
    const now = Date.now()

    return {
      totalEntries: this.cache.size,
      maxSize: this.options.maxSize,
      expiredEntries: entries.filter((entry) => this.isExpired(entry)).length,
      averageTTL:
        entries.reduce((sum, entry) => sum + (entry.ttl || 0), 0) /
          entries.length || 0,
      totalAccessCount: entries.reduce(
        (sum, entry) => sum + entry.accessCount,
        0,
      ),
      averageAge:
        entries.reduce(
          (sum, entry) => sum + (now - entry.createdAt.getTime()),
          0,
        ) /
          entries.length /
          1000 || 0,
      hitRate:
        entries.length > 0
          ? entries.reduce((sum, entry) => sum + entry.accessCount, 0) /
            entries.length
          : 0,
    }
  }

  /**
   * Get or set with normalization (cache-aside pattern)
   */
  async getOrSet<T = any>(
    key: string,
    factory: () => Promise<T>,
    options: { ttl?: number; normalize?: boolean; schema?: string } = {},
  ): Promise<T> {
    let value = await this.get<T>(key, options.normalize)

    if (value === null) {
      value = await factory()
      await this.set(key, value, options)
    }

    return value
  }

  /**
   * Check if key exists and is not expired
   */
  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key)
    return entry !== undefined && !this.isExpired(entry)
  }

  /**
   * Get multiple keys at once
   */
  async getMany<T = any>(
    keys: string[],
    normalize: boolean = true,
  ): Promise<Map<string, T>> {
    const result = new Map<string, T>()

    for (const key of keys) {
      const value = await this.get<T>(key, normalize)
      if (value !== null) {
        result.set(key, value)
      }
    }

    return result
  }

  /**
   * Set multiple entries at once
   */
  async setMany(
    entries: Array<{
      key: string
      value: any
      options?: { ttl?: number; normalize?: boolean; schema?: string }
    }>,
  ): Promise<void> {
    for (const { key, value, options = {} } of entries) {
      await this.set(key, value, options)
    }
  }

  /**
   * Get cache keys matching pattern
   */
  getKeys(pattern?: string): string[] {
    const keys = Array.from(this.cache.keys())

    if (!pattern) {
      return keys
    }

    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    return keys.filter((key) => regex.test(key))
  }

  /**
   * Check if entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    if (!entry.ttl) return false
    return Date.now() - entry.createdAt.getTime() > entry.ttl
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let lruKey: string | null = null
    let lruTime = Number.MAX_SAFE_INTEGER
    let lruCreatedAt = Number.MAX_SAFE_INTEGER

    for (const [key, entry] of this.cache.entries()) {
      const accessTime = entry.lastAccessedAt.getTime()
      const createdTime = entry.createdAt.getTime()

      // Primary criteria: last accessed time
      // Secondary criteria: creation time (for ties)
      if (
        accessTime < lruTime ||
        (accessTime === lruTime && createdTime < lruCreatedAt)
      ) {
        lruTime = accessTime
        lruCreatedAt = createdTime
        lruKey = key
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey)
      this.logger.debug(`Evicted LRU entry: ${lruKey}`)
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const expiredKeys: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        expiredKeys.push(key)
      }
    }

    for (const key of expiredKeys) {
      this.cache.delete(key)
    }

    if (expiredKeys.length > 0) {
      this.logger.debug(`Cleaned up ${expiredKeys.length} expired entries`)
    }
  }
}
