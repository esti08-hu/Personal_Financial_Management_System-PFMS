import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { CacheEntry, CacheService, DataNormalizer } from './cache.service'

const mockConfigService = {
  get: jest.fn((key: string, defaultValue?: any) => {
    const config = {
      CACHE_TTL: 3600000, // 1 hour
      CACHE_MAX_SIZE: 100,
      CACHE_COMPRESSION: false,
    }
    return config[key] || defaultValue
  }),
}

describe('DataNormalizer', () => {
  describe('normalizeFinancialData', () => {
    it('should normalize financial data correctly', () => {
      const input = {
        totalIncome: '1000.50',
        totalExpenses: 500,
        netIncome: 500.5,
        categories: [
          { name: 'Food', amount: 200, percentage: 40, transactionCount: 5 },
          {
            name: 'Transport',
            amount: 150,
            percentage: 30,
            transactionCount: 3,
          },
        ],
        timeframe: {
          start: '2024-01-01',
          end: '2024-01-31',
          label: 'January 2024',
        },
        anomalyDetected: true,
        anomalyScore: 15,
      }

      const result = DataNormalizer.normalizeFinancialData(input)

      expect(result.schema).toBe('financial_data')
      expect(result.version).toBe('1.0.0')
      expect(result.normalized.totalIncome).toBe(1000.5)
      expect(result.normalized.totalExpenses).toBe(500)
      expect(result.normalized.categories).toHaveLength(2)
      expect(result.normalized.timeframe).toBeInstanceOf(Object)
      expect(result.normalized.anomalyDetected).toBe(true)
      expect(result.metadata.hasCategories).toBe(true)
    })
  })

  describe('normalizeUserProfile', () => {
    it('should normalize user profile data', () => {
      const input = {
        id: '123',
        email: '  JOHN@EXAMPLE.COM  ',
        firstName: 'John',
        lastName: 'Doe',
        preferences: {
          currency: 'EUR',
          timezone: 'Europe/London',
          notifications: false,
        },
        createdAt: '2024-01-01T00:00:00Z',
      }

      const result = DataNormalizer.normalizeUserProfile(input)

      expect(result.schema).toBe('user_profile')
      expect(result.normalized.email).toBe('john@example.com')
      expect(result.normalized.firstName).toBe('John')
      expect(result.normalized.preferences.currency).toBe('EUR')
      expect(result.normalized.createdAt).toBeInstanceOf(Date)
    })
  })

  describe('normalizeTransaction', () => {
    it('should normalize transaction data', () => {
      const input = {
        id: '456',
        userId: '123',
        amount: '50.25',
        type: 'EXPENSE',
        category: 'Food',
        description: ' Lunch at restaurant ',
        date: '2024-01-15',
        tags: ['dining', 'work'],
      }

      const result = DataNormalizer.normalizeTransaction(input)

      expect(result.schema).toBe('transaction')
      expect(result.normalized.amount).toBe(50.25)
      expect(result.normalized.type).toBe('expense')
      expect(result.normalized.category).toBe('food')
      expect(result.normalized.description).toBe('Lunch at restaurant')
      expect(result.normalized.tags).toEqual(['dining', 'work'])
    })
  })

  describe('normalizeAnalytics', () => {
    it('should normalize analytics data', () => {
      const input = {
        userId: '123',
        period: {
          start: '2024-01-01',
          end: '2024-01-31',
          label: 'January 2024',
        },
        metrics: {
          totalTransactions: '50',
          totalVolume: 5000,
          topCategories: [{ name: 'Food', amount: 2000, percentage: 40 }],
        },
      }

      const result = DataNormalizer.normalizeAnalytics(input)

      expect(result.schema).toBe('analytics')
      expect(result.normalized.metrics.totalTransactions).toBe(50)
      expect(result.normalized.metrics.topCategories).toHaveLength(1)
      expect(result.metadata.periodDays).toBe(30)
    })
  })

  describe('normalizeConversation', () => {
    it('should normalize conversation data', () => {
      const input = {
        id: 'conv-123',
        userId: '123',
        messages: [
          {
            role: 'USER',
            content: ' Hello world ',
            timestamp: '2024-01-01T10:00:00Z',
          },
        ],
        context: { topic: 'finance' },
      }

      const result = DataNormalizer.normalizeConversation(input)

      expect(result.schema).toBe('conversation')
      expect(result.normalized.messages[0].content).toBe('Hello world')
      expect(result.normalized.messages[0].role).toBe('user')
      expect(result.metadata.messageCount).toBe(1)
    })
  })

  describe('normalize (auto-detect)', () => {
    it('should auto-detect financial data', () => {
      const input = { totalIncome: 1000, totalExpenses: 500 }
      const result = DataNormalizer.normalize(input)
      expect(result.schema).toBe('financial_data')
    })

    it('should auto-detect user profile', () => {
      const input = { email: 'test@example.com', firstName: 'John' }
      const result = DataNormalizer.normalize(input)
      expect(result.schema).toBe('user_profile')
    })

    it('should auto-detect transaction', () => {
      const input = { amount: 100, type: 'expense' }
      const result = DataNormalizer.normalize(input)
      expect(result.schema).toBe('transaction')
    })
  })
})

describe('CacheService', () => {
  let service: CacheService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile()

    service = module.get<CacheService>(CacheService)
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('set and get', () => {
    it('should set and get a value', async () => {
      const key = 'test-key'
      const value = { data: 'test-value' }

      await service.set(key, value)
      const retrieved = await service.get(key)

      expect(retrieved).toEqual(value)
    })

    it('should return null for non-existent key', async () => {
      const retrieved = await service.get('non-existent')
      expect(retrieved).toBeNull()
    })

    it('should handle TTL expiration', async () => {
      const key = 'ttl-key'
      const value = 'test'

      await service.set(key, value, { ttl: 100 }) // 100ms TTL
      let retrieved = await service.get(key)
      expect(retrieved).toBe(value)

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 150))

      retrieved = await service.get(key)
      expect(retrieved).toBeNull()
    })
  })

  describe('normalization', () => {
    it('should normalize data when setting', async () => {
      const key = 'normalized-key'
      const financialData = {
        totalIncome: '1000',
        totalExpenses: 500,
        categories: [{ name: 'Food', amount: 200 }],
      }

      await service.set(key, financialData, { normalize: true })
      const retrieved = await service.get(key, false) // Get raw normalized data

      expect(retrieved).toHaveProperty('normalized')
      expect(retrieved.normalized.totalIncome).toBe(1000)
      expect(retrieved.schema).toBe('financial_data')
    })

    it('should return normalized data when getting', async () => {
      const key = 'normalized-get-key'
      const financialData = {
        totalIncome: '1000',
        totalExpenses: 500,
      }

      await service.set(key, financialData, { normalize: true })
      const retrieved = await service.get(key, true) // Get normalized data

      expect(retrieved).toEqual({
        totalIncome: 1000,
        totalExpenses: 500,
        netIncome: 0,
        categories: [],
        timeframe: null,
        anomalyDetected: false,
        anomalyScore: 0,
      })
    })
  })

  describe('cache management', () => {
    it('should delete entries', async () => {
      const key = 'delete-key'
      await service.set(key, 'value')

      let exists = await service.has(key)
      expect(exists).toBe(true)

      const deleted = await service.delete(key)
      expect(deleted).toBe(true)

      exists = await service.has(key)
      expect(exists).toBe(false)
    })

    it('should clear all entries', async () => {
      await service.set('key1', 'value1')
      await service.set('key2', 'value2')

      expect(await service.has('key1')).toBe(true)
      expect(await service.has('key2')).toBe(true)

      await service.clear()

      expect(await service.has('key1')).toBe(false)
      expect(await service.has('key2')).toBe(false)
    })

    it('should handle max size limit', async () => {
      // Create a separate config service mock for this test
      const smallCacheConfig = {
        get: jest.fn((key: string, defaultValue?: any) => {
          const config = {
            CACHE_TTL: 3600000,
            CACHE_MAX_SIZE: 2, // Smaller cache for this test
            CACHE_COMPRESSION: false,
          }
          return config[key] || defaultValue
        }),
      }

      // Create new service instance with smaller cache
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CacheService,
          {
            provide: ConfigService,
            useValue: smallCacheConfig,
          },
        ],
      }).compile()

      const smallCacheService = module.get<CacheService>(CacheService)

      await smallCacheService.set('key1', 'value1')
      await smallCacheService.set('key2', 'value2')
      await smallCacheService.set('key3', 'value3') // Should evict oldest

      expect(await smallCacheService.has('key1')).toBe(false) // Should be evicted
      expect(await smallCacheService.has('key2')).toBe(true)
      expect(await smallCacheService.has('key3')).toBe(true)
    })
  })

  describe('getOrSet', () => {
    it('should return cached value if exists', async () => {
      const key = 'getorset-key'
      const value = 'cached-value'
      const factory = jest.fn().mockResolvedValue('factory-value')

      await service.set(key, value)

      const result = await service.getOrSet(key, factory)

      expect(result).toBe(value)
      expect(factory).not.toHaveBeenCalled()
    })

    it('should call factory and cache result if not exists', async () => {
      const key = 'getorset-factory-key'
      const factoryValue = 'factory-result'
      const factory = jest.fn().mockResolvedValue(factoryValue)

      const result = await service.getOrSet(key, factory)

      expect(result).toBe(factoryValue)
      expect(factory).toHaveBeenCalledTimes(1)

      // Should be cached now
      const cached = await service.get(key)
      expect(cached).toBe(factoryValue)
    })
  })

  describe('bulk operations', () => {
    it('should get multiple keys', async () => {
      await service.set('bulk1', 'value1')
      await service.set('bulk2', 'value2')
      await service.set('bulk3', 'value3')

      const results = await service.getMany(['bulk1', 'bulk2', 'missing'])

      expect(results.size).toBe(2)
      expect(results.get('bulk1')).toBe('value1')
      expect(results.get('bulk2')).toBe('value2')
      expect(results.has('missing')).toBe(false)
    })

    it('should set multiple entries', async () => {
      const entries = [
        { key: 'multi1', value: 'value1' },
        { key: 'multi2', value: 'value2', options: { ttl: 1000 } },
      ]

      await service.setMany(entries)

      expect(await service.get('multi1')).toBe('value1')
      expect(await service.get('multi2')).toBe('value2')
    })
  })

  describe('statistics', () => {
    it('should return cache statistics', async () => {
      await service.set('stats1', 'value1', { ttl: 3600000 })
      await service.set('stats2', 'value2')

      // Access one entry multiple times
      await service.get('stats1')
      await service.get('stats1')
      await service.get('stats1')

      const stats = service.getStats()

      expect(stats.totalEntries).toBe(2)
      expect(stats.maxSize).toBe(100)
      expect(stats.totalAccessCount).toBe(3)
      expect(typeof stats.averageAge).toBe('number')
    })
  })

  describe('key patterns', () => {
    it('should get keys matching pattern', async () => {
      await service.set('user:123:profile', 'profile')
      await service.set('user:123:transactions', 'transactions')
      await service.set('user:456:profile', 'profile2')

      const userKeys = service.getKeys('user:123:*')
      expect(userKeys).toHaveLength(2)
      expect(userKeys).toContain('user:123:profile')
      expect(userKeys).toContain('user:123:transactions')

      const allKeys = service.getKeys()
      expect(allKeys).toHaveLength(3)
    })
  })
})
