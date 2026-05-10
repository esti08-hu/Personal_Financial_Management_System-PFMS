import { Test, TestingModule } from '@nestjs/testing'
import { DrizzleService } from '../../database/drizzle.service'
import { AnomalyDetectionService } from './anomaly-detection.service'

// Mock DrizzleService with proper query builder methods
const createMockQueryBuilder = () => ({
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockResolvedValue([]),
  groupBy: jest.fn().mockReturnThis(),
  execute: jest.fn(),
})

const mockDrizzleService = {
  db: createMockQueryBuilder(),
}

describe('AnomalyDetectionService', () => {
  let service: AnomalyDetectionService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnomalyDetectionService,
        {
          provide: DrizzleService,
          useValue: mockDrizzleService,
        },
      ],
    }).compile()

    service = module.get<AnomalyDetectionService>(AnomalyDetectionService)
  })

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset the mock query builder
    Object.assign(mockDrizzleService.db, createMockQueryBuilder())
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('detectAnomalies', () => {
    it('should detect anomaly when expenses exceed threshold', async () => {
      // Mock threshold query - orderBy returns the config
      mockDrizzleService.db.orderBy.mockResolvedValueOnce([
        {
          rateLimitMultiplier: 2,
          anomalyScoreThreshold: 10,
          consecutiveFailuresThreshold: 5,
        },
      ])

      // Mock baseline calculation queries - where returns the data
      mockDrizzleService.db.where
        .mockResolvedValueOnce([{ total: 1000 }]) // baseline expenses
        .mockResolvedValueOnce([{ count: 10 }]) // baseline transaction count

      const result = await service.detectAnomalies(1, 500)

      expect(result.isAnomaly).toBe(true)
      expect(result.score).toBeGreaterThan(10)
      expect(result.reason).toBeDefined()
    })

    it('should not detect anomaly when expenses are within normal range', async () => {
      // Mock threshold query - orderBy returns the config
      mockDrizzleService.db.orderBy.mockResolvedValueOnce([
        {
          rateLimitMultiplier: 2,
          anomalyScoreThreshold: 10,
          consecutiveFailuresThreshold: 5,
        },
      ])

      // Mock baseline calculation queries - where returns the data
      mockDrizzleService.db.where
        .mockResolvedValueOnce([{ total: 1000 }]) // baseline expenses
        .mockResolvedValueOnce([{ count: 10 }]) // baseline transaction count

      const result = await service.detectAnomalies(1, 50) // Much lower expenses

      expect(result.isAnomaly).toBe(false)
      expect(result.score).toBe(0)
      expect(result.reason).toBeUndefined()
    })

    it('should use default threshold when no config found', async () => {
      // Mock empty threshold query - orderBy returns empty array
      mockDrizzleService.db.orderBy.mockResolvedValueOnce([])

      // Mock baseline calculation queries - where returns the data
      mockDrizzleService.db.where
        .mockResolvedValueOnce([{ total: 1000 }]) // baseline expenses
        .mockResolvedValueOnce([{ count: 10 }]) // baseline transaction count

      const result = await service.detectAnomalies(1, 500)

      expect(result.threshold).toBe(10) // Default threshold
      expect(result.isAnomaly).toBe(true)
    })

    it('should handle timeframe-based anomaly detection', async () => {
      const timeframe = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
        label: 'January 2024',
      }

      // Mock threshold query - orderBy returns the config
      mockDrizzleService.db.orderBy.mockResolvedValueOnce([
        {
          rateLimitMultiplier: 2,
          anomalyScoreThreshold: 10,
          consecutiveFailuresThreshold: 5,
        },
      ])

      // Mock baseline calculation queries - where returns the data
      mockDrizzleService.db.where
        .mockResolvedValueOnce([{ total: 2000 }]) // baseline expenses
        .mockResolvedValueOnce([{ count: 20 }]) // baseline transaction count

      const result = await service.detectAnomalies(1, 800, timeframe)

      expect(result.isAnomaly).toBe(true)
      expect(result.score).toBeGreaterThan(10)
    })

    it('should handle zero baseline transactions', async () => {
      // Mock threshold query - orderBy returns the config
      mockDrizzleService.db.orderBy.mockResolvedValueOnce([
        {
          rateLimitMultiplier: 2,
          anomalyScoreThreshold: 10,
          consecutiveFailuresThreshold: 5,
        },
      ])

      // Mock baseline calculation queries with zero transactions - where returns the data
      mockDrizzleService.db.where
        .mockResolvedValueOnce([{ total: 0 }]) // baseline expenses
        .mockResolvedValueOnce([{ count: 0 }]) // baseline transaction count

      const result = await service.detectAnomalies(1, 100)

      expect(result.isAnomaly).toBe(true) // Any expense is anomalous with zero baseline
      expect(result.score).toBeGreaterThan(10)
    })
  })
})
