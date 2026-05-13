import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { RateLimitRepository } from './rate-limit.repository'
import { RateLimitService } from './rate-limit.service'

const mockConfigService = {
  get: jest.fn((key: string, defaultValue?: any) => {
    const config = {
      RATE_LIMIT_WINDOW_MS: 60000, // 1 minute
      RATE_LIMIT_MAX_REQUESTS: 10,
      RATE_LIMIT_BUCKET_COUNT: 6,
    }
    return config[key] || defaultValue
  }),
}

const mockRateLimitRepository = {
  incrementCounters: jest.fn(),
  getUsageSnapshot: jest.fn(),
}

describe('RateLimitService', () => {
  let service: RateLimitService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimitService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: RateLimitRepository,
          useValue: mockRateLimitRepository,
        },
      ],
    }).compile()

    service = module.get<RateLimitService>(RateLimitService)
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('checkLimit', () => {
    it('should allow requests within limit', async () => {
      const userId = 1
      const action = 'test'

      for (let i = 0; i < 10; i++) {
        const result = await service.checkLimit(userId, action)
        expect(result.allowed).toBe(true)
        expect(result.remainingRequests).toBe(9 - i)
      }
    })

    it('should deny requests over limit', async () => {
      const userId = 1
      const action = 'test'

      // Use up all requests
      for (let i = 0; i < 10; i++) {
        await service.checkLimit(userId, action)
      }

      // Next request should be denied
      const result = await service.checkLimit(userId, action)
      expect(result.allowed).toBe(false)
      expect(result.remainingRequests).toBe(0)
      expect(result.retryAfter).toBeDefined()
    })

    it('should handle different actions separately', async () => {
      const userId = 1

      // Use up limit for action1
      for (let i = 0; i < 10; i++) {
        await service.checkLimit(userId, 'action1')
      }

      // action2 should still be allowed
      const result = await service.checkLimit(userId, 'action2')
      expect(result.allowed).toBe(true)
      expect(result.remainingRequests).toBe(9)
    })

    it('should handle different users separately', async () => {
      const action = 'test'

      // Use up limit for user1
      for (let i = 0; i < 10; i++) {
        await service.checkLimit(1, action)
      }

      // user2 should still be allowed
      const result = await service.checkLimit(2, action)
      expect(result.allowed).toBe(true)
      expect(result.remainingRequests).toBe(9)
    })

    it('should respect custom limits', async () => {
      const userId = 1
      const action = 'test'
      const customOptions = { maxRequests: 3 }

      // Use up custom limit
      for (let i = 0; i < 3; i++) {
        const result = await service.checkLimit(userId, action, customOptions)
        expect(result.allowed).toBe(true)
        expect(result.remainingRequests).toBe(2 - i)
      }

      // Next request should be denied
      const result = await service.checkLimit(userId, action, customOptions)
      expect(result.allowed).toBe(false)
    })

    it('should update daily usage in repository', async () => {
      const userId = 1
      const action = 'gemini'

      await service.checkLimit(userId, action)

      expect(mockRateLimitRepository.incrementCounters).toHaveBeenCalledWith({
        userId,
        date: expect.any(Date),
        geminiCallsIncrement: 1,
      })
    })
  })

  describe('getStatus', () => {
    it('should return current status', async () => {
      const userId = 1
      const action = 'test'

      // Make some requests
      await service.checkLimit(userId, action)
      await service.checkLimit(userId, action)

      const status = await service.getStatus(userId, action)

      expect(status.currentRequests).toBe(2)
      expect(status.maxRequests).toBe(10)
      expect(status.windowStart).toBeInstanceOf(Date)
      expect(status.windowEnd).toBeInstanceOf(Date)
      expect(status.resetTime).toBeInstanceOf(Date)
    })

    it('should handle empty status', async () => {
      const userId = 1
      const action = 'test'

      const status = await service.getStatus(userId, action)

      expect(status.currentRequests).toBe(0)
      expect(status.maxRequests).toBe(10)
    })
  })

  describe('resetLimit', () => {
    it('should reset rate limit for user and action', async () => {
      const userId = 1
      const action = 'test'

      // Use up some requests
      await service.checkLimit(userId, action)
      await service.checkLimit(userId, action)

      let status = await service.getStatus(userId, action)
      expect(status.currentRequests).toBe(2)

      // Reset
      await service.resetLimit(userId, action)

      status = await service.getStatus(userId, action)
      expect(status.currentRequests).toBe(0)
    })
  })

  describe('sliding window behavior', () => {
    it('should allow requests after window slides', async () => {
      const userId = 1
      const action = 'test'
      const shortWindowOptions = { windowSizeMs: 100, maxRequests: 2 }

      // Use up requests
      await service.checkLimit(userId, action, shortWindowOptions)
      await service.checkLimit(userId, action, shortWindowOptions)

      // Should be at limit
      let result = await service.checkLimit(userId, action, shortWindowOptions)
      expect(result.allowed).toBe(false)

      // Wait for window to slide
      await new Promise((resolve) => setTimeout(resolve, 150))

      // Should allow new requests
      result = await service.checkLimit(userId, action, shortWindowOptions)
      expect(result.allowed).toBe(true)
    })
  })

  describe('checkDailyLimit', () => {
    it('should allow requests within daily limit', async () => {
      const userId = 1
      const action = 'gemini'
      const dailyLimit = 100

      mockRateLimitRepository.getUsageSnapshot.mockResolvedValue({
        id: 1,
        userId,
        date: new Date(),
        geminiCallsUsed: 50,
        minuteCallsUsed: 0,
        cacheHits: 0,
        lastResetAt: null,
      })

      const result = await service.checkDailyLimit(userId, action, dailyLimit)

      expect(result.allowed).toBe(true)
      expect(result.used).toBe(50)
      expect(result.remaining).toBe(50)
    })

    it('should deny requests over daily limit', async () => {
      const userId = 1
      const action = 'gemini'
      const dailyLimit = 100

      mockRateLimitRepository.getUsageSnapshot.mockResolvedValue({
        id: 1,
        userId,
        date: new Date(),
        geminiCallsUsed: 100,
        minuteCallsUsed: 0,
        cacheHits: 0,
        lastResetAt: null,
      })

      const result = await service.checkDailyLimit(userId, action, dailyLimit)

      expect(result.allowed).toBe(false)
      expect(result.used).toBe(100)
      expect(result.remaining).toBe(0)
    })

    it('should handle missing snapshot', async () => {
      const userId = 1
      const action = 'gemini'
      const dailyLimit = 100

      mockRateLimitRepository.getUsageSnapshot.mockResolvedValue(null)

      const result = await service.checkDailyLimit(userId, action, dailyLimit)

      expect(result.allowed).toBe(true)
      expect(result.used).toBe(0)
      expect(result.remaining).toBe(100)
    })

    it('should handle repository errors gracefully', async () => {
      const userId = 1
      const action = 'gemini'
      const dailyLimit = 100

      mockRateLimitRepository.getUsageSnapshot.mockRejectedValue(
        new Error('DB error'),
      )

      const result = await service.checkDailyLimit(userId, action, dailyLimit)

      expect(result.allowed).toBe(true)
      expect(result.used).toBe(0)
      expect(result.remaining).toBe(100)
    })
  })

  describe('checkCombinedLimit', () => {
    it('should allow when both limits are okay', async () => {
      const userId = 1
      const action = 'gemini'
      const dailyLimit = 100

      mockRateLimitRepository.getUsageSnapshot.mockResolvedValue({
        id: 1,
        userId,
        date: new Date(),
        geminiCallsUsed: 5,
        minuteCallsUsed: 0,
        cacheHits: 0,
        lastResetAt: null,
      })

      const result = await service.checkCombinedLimit(
        userId,
        action,
        {},
        dailyLimit,
      )

      expect(result.allowed).toBe(true)
      expect(result.dailyUsed).toBe(5)
      expect(result.dailyRemaining).toBe(95)
    })

    it('should deny when sliding window limit exceeded', async () => {
      const userId = 1
      const action = 'test'
      const dailyLimit = 100

      // Use up sliding window limit
      for (let i = 0; i < 10; i++) {
        await service.checkLimit(userId, action)
      }

      mockRateLimitRepository.getUsageSnapshot.mockResolvedValue({
        id: 1,
        userId,
        date: new Date(),
        geminiCallsUsed: 5,
        minuteCallsUsed: 0,
        cacheHits: 0,
        lastResetAt: null,
      })

      const result = await service.checkCombinedLimit(
        userId,
        action,
        {},
        dailyLimit,
      )

      expect(result.allowed).toBe(false)
      expect(result.dailyUsed).toBeUndefined() // Not checked because sliding window failed
    })

    it('should deny when daily limit exceeded', async () => {
      const userId = 1
      const action = 'gemini'
      const dailyLimit = 10

      mockRateLimitRepository.getUsageSnapshot.mockResolvedValue({
        id: 1,
        userId,
        date: new Date(),
        geminiCallsUsed: 10,
        minuteCallsUsed: 0,
        cacheHits: 0,
        lastResetAt: null,
      })

      const result = await service.checkCombinedLimit(
        userId,
        action,
        {},
        dailyLimit,
      )

      expect(result.allowed).toBe(false)
      expect(result.dailyUsed).toBe(10)
      expect(result.dailyRemaining).toBe(0)
      expect(result.retryAfter).toBe(86400) // 24 hours
    })
  })

  describe('getStats', () => {
    it('should return statistics', async () => {
      // Make some requests to generate stats
      await service.checkLimit(1, 'action1')
      await service.checkLimit(1, 'action1')
      await service.checkLimit(2, 'action2')

      const stats = service.getStats()

      expect(stats.totalKeys).toBeGreaterThan(0)
      expect(stats.totalRequests).toBe(3)
      expect(stats.config).toBeDefined()
      expect(stats.config.maxRequests).toBe(10)
    })
  })

  describe('cleanup', () => {
    it('should clean up expired buckets', async () => {
      const userId = 1
      const action = 'test'
      const shortWindowOptions = { windowSizeMs: 100 }

      // Make requests
      await service.checkLimit(userId, action, shortWindowOptions)
      await service.checkLimit(userId, action, shortWindowOptions)

      let status = await service.getStatus(userId, action, shortWindowOptions)
      expect(status.currentRequests).toBe(2)

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 150))

      // Trigger cleanup (normally done by interval)
      ;(service as any).cleanupExpiredBuckets()

      status = await service.getStatus(userId, action, shortWindowOptions)
      expect(status.currentRequests).toBe(0)
    })
  })
})
