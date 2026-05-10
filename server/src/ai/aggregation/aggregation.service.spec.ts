import { Test, TestingModule } from '@nestjs/testing'
import { DrizzleService } from '../../database/drizzle.service'
import { AnomalyDetectionService } from '../anomaly'
import { AggregationService } from './aggregation.service'

// Mock services
const createMockQueryBuilder = () => {
  const mockBuilder = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockResolvedValue([]),
    orderBy: jest.fn().mockResolvedValue([]),
    limit: jest.fn().mockReturnThis(),
    execute: jest.fn(),
  }
  return mockBuilder
}

const mockDrizzleService = {
  db: createMockQueryBuilder(),
}

const mockAnomalyDetectionService = {
  detectAnomalies: jest.fn(),
}

describe('AggregationService', () => {
  let service: AggregationService
  let _drizzleService: DrizzleService
  let _anomalyDetectionService: AnomalyDetectionService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AggregationService,
        {
          provide: DrizzleService,
          useValue: mockDrizzleService,
        },
        {
          provide: AnomalyDetectionService,
          useValue: mockAnomalyDetectionService,
        },
      ],
    }).compile()

    service = module.get<AggregationService>(AggregationService)
    _drizzleService = module.get<DrizzleService>(DrizzleService)
    _anomalyDetectionService = module.get<AnomalyDetectionService>(
      AnomalyDetectionService,
    )
  })

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset the mock query builder
    Object.assign(mockDrizzleService.db, createMockQueryBuilder())
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('aggregateFinancialData', () => {
    it('should aggregate financial data without timeframe', async () => {
      // Mock the database calls - each chain returns the mock db object
      mockDrizzleService.db.where
        .mockResolvedValueOnce([{ total: 1000 }]) // income
        .mockResolvedValueOnce([{ total: 500 }]) // expenses
        .mockResolvedValueOnce([{ count: 10 }]) // transaction count
        .mockReturnValueOnce(mockDrizzleService.db) // category breakdown - continue chain
      mockDrizzleService.db.groupBy.mockResolvedValueOnce([]) // category breakdown result

      // Mock anomaly detection
      mockAnomalyDetectionService.detectAnomalies.mockResolvedValueOnce({
        isAnomaly: false,
        score: 0,
        threshold: 10,
      })

      const result = await service.aggregateFinancialData(1)

      expect(result.totalIncome).toBe(1000)
      expect(result.totalExpenses).toBe(500)
      expect(result.netAmount).toBe(500)
      expect(result.transactionCount).toBe(10)
      expect(result.categoryBreakdown).toEqual([])
      expect(result.periodComparison).toBeUndefined()
      expect(result.anomalyDetection).toBeDefined()
      expect(mockAnomalyDetectionService.detectAnomalies).toHaveBeenCalledWith(
        1,
        500,
        undefined,
      )
    })

    it('should aggregate financial data with timeframe', async () => {
      const timeframe = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
        label: 'January 2024',
      }

      // Mock all the database calls
      mockDrizzleService.db.where
        .mockResolvedValueOnce([{ total: 2000 }]) // income
        .mockResolvedValueOnce([{ total: 800 }]) // expenses
        .mockResolvedValueOnce([{ count: 15 }]) // transaction count
        .mockReturnValueOnce(mockDrizzleService.db) // category breakdown - continue chain
        .mockResolvedValueOnce([{ total: 1500 }]) // previous period income
        .mockResolvedValueOnce([{ total: 700 }]) // previous period expenses
        .mockResolvedValueOnce([{ count: 12 }]) // previous period count
      mockDrizzleService.db.groupBy.mockResolvedValueOnce([
        { category: 'Withdrawal', totalAmount: 600, transactionCount: 10 },
        { category: 'Transfer', totalAmount: 200, transactionCount: 5 },
      ]) // category breakdown result

      // Mock anomaly detection
      mockAnomalyDetectionService.detectAnomalies.mockResolvedValueOnce({
        isAnomaly: true,
        score: 15,
        threshold: 10,
        reason: 'Expenses exceed expected maximum',
      })

      const result = await service.aggregateFinancialData(1, timeframe)

      expect(result.totalIncome).toBe(2000)
      expect(result.totalExpenses).toBe(800)
      expect(result.netAmount).toBe(1200)
      expect(result.transactionCount).toBe(15)
      expect(result.categoryBreakdown).toHaveLength(2)
      expect(result.periodComparison).toBeDefined()
      expect(result.anomalyDetection).toBeDefined()
      expect(mockAnomalyDetectionService.detectAnomalies).toHaveBeenCalledWith(
        1,
        800,
        timeframe,
      )
    })
  })

  describe('getTotalAmount', () => {
    beforeEach(() => {
      mockDrizzleService.db.select.mockReturnValue(mockDrizzleService.db)
      mockDrizzleService.db.from.mockReturnValue(mockDrizzleService.db)
      mockDrizzleService.db.where.mockReturnValue(mockDrizzleService.db)
    })

    it('should get total amount for single transaction type', async () => {
      mockDrizzleService.db.where.mockResolvedValueOnce([{ total: 1500 }])

      const result = await (service as any).getTotalAmount(1, 'Deposit')

      expect(result.total).toBe(1500)
      expect(mockDrizzleService.db.select).toHaveBeenCalledWith({
        total: expect.any(Object), // sum function
      })
    })

    it('should get total amount for multiple transaction types', async () => {
      mockDrizzleService.db.where.mockResolvedValueOnce([{ total: 800 }])

      const result = await (service as any).getTotalAmount(1, [
        'Withdrawal',
        'Transfer',
      ])

      expect(result.total).toBe(800)
    })

    it('should return 0 when no transactions found', async () => {
      mockDrizzleService.db.where.mockResolvedValueOnce([{ total: null }])

      const result = await (service as any).getTotalAmount(1, 'Deposit')

      expect(result.total).toBe(0)
    })
  })

  describe('getTransactionCount', () => {
    beforeEach(() => {
      mockDrizzleService.db.select.mockReturnValue(mockDrizzleService.db)
      mockDrizzleService.db.from.mockReturnValue(mockDrizzleService.db)
      mockDrizzleService.db.where.mockReturnValue(mockDrizzleService.db)
    })

    it('should get transaction count', async () => {
      mockDrizzleService.db.where.mockResolvedValueOnce([{ count: 25 }])

      const result = await (service as any).getTransactionCount(1)

      expect(result).toBe(25)
    })

    it('should return 0 when no transactions found', async () => {
      mockDrizzleService.db.where.mockResolvedValueOnce([{ count: 0 }])

      const result = await (service as any).getTransactionCount(1)

      expect(result).toBe(0)
    })
  })

  describe('getCategoryBreakdown', () => {
    beforeEach(() => {
      mockDrizzleService.db.select.mockReturnValue(mockDrizzleService.db)
      mockDrizzleService.db.from.mockReturnValue(mockDrizzleService.db)
      mockDrizzleService.db.where.mockReturnValue(mockDrizzleService.db)
      mockDrizzleService.db.groupBy.mockReturnValue(mockDrizzleService.db)
    })

    it('should get category breakdown', async () => {
      mockDrizzleService.db.groupBy.mockResolvedValueOnce([
        { category: 'Withdrawal', totalAmount: 500, transactionCount: 8 },
        { category: 'Transfer', totalAmount: 300, transactionCount: 4 },
      ])

      const result = await (service as any).getCategoryBreakdown(1)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        category: 'Withdrawal',
        amount: 500,
        transactionCount: 8,
        percentage: 62.5, // 500 / 800 * 100
      })
      expect(result[1]).toEqual({
        category: 'Transfer',
        amount: 300,
        transactionCount: 4,
        percentage: 37.5, // 300 / 800 * 100
      })
    })

    it('should filter categories when provided', async () => {
      mockDrizzleService.db.groupBy.mockResolvedValueOnce([
        { category: 'Withdrawal', totalAmount: 500, transactionCount: 8 },
        { category: 'Transfer', totalAmount: 300, transactionCount: 4 },
      ])

      const result = await (service as any).getCategoryBreakdown(1, undefined, [
        'Withdrawal',
      ])

      expect(result).toHaveLength(1)
      expect(result[0].category).toBe('Withdrawal')
    })

    it('should handle empty results', async () => {
      mockDrizzleService.db.groupBy.mockResolvedValueOnce([])

      const result = await (service as any).getCategoryBreakdown(1)

      expect(result).toEqual([])
    })
  })

  describe('getPeriodComparison', () => {
    beforeEach(() => {
      mockDrizzleService.db.select.mockReturnValue(mockDrizzleService.db)
      mockDrizzleService.db.from.mockReturnValue(mockDrizzleService.db)
      mockDrizzleService.db.where.mockReturnValue(mockDrizzleService.db)
    })

    it('should compare current and previous periods', async () => {
      const timeframe = {
        start: new Date('2024-02-01'),
        end: new Date('2024-02-29'),
        label: 'February 2024',
      }

      // Mock current period calls
      mockDrizzleService.db.where
        .mockResolvedValueOnce([{ total: 2000 }]) // current income
        .mockResolvedValueOnce([{ total: 800 }]) // current expenses
        .mockResolvedValueOnce([{ count: 15 }]) // current count
        .mockResolvedValueOnce([{ total: 1800 }]) // previous income
        .mockResolvedValueOnce([{ total: 900 }]) // previous expenses
        .mockResolvedValueOnce([{ count: 12 }]) // previous count

      const result = await (service as any).getPeriodComparison(1, timeframe)

      expect(result.current.total).toBe(1200) // 2000 - 800
      expect(result.previous.total).toBe(900) // 1800 - 900
      expect(result.change.amount).toBe(300) // 1200 - 900
      expect(result.change.percentage).toBeCloseTo(33.33, 2) // 300 / 900 * 100
    })
  })
})
