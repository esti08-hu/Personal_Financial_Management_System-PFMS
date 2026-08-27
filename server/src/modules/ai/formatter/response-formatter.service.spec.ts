import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { ResponseFormatterService } from './response-formatter.service'

describe('ResponseFormatterService', () => {
  let service: ResponseFormatterService
  let configService: ConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResponseFormatterService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('USD'),
          },
        },
      ],
    }).compile()

    service = module.get<ResponseFormatterService>(ResponseFormatterService)
    configService = module.get<ConfigService>(ConfigService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('formatFinancialSummary', () => {
    it('should format financial summary with positive savings', () => {
      const result = service.formatFinancialSummary(
        5000,
        3500,
        1500,
        'This Month',
      )

      expect(result.text).toContain('Financial Summary')
      expect(result.text).toContain('$5,000.00')
      expect(result.text).toContain('$3,500.00')
      expect(result.text).toContain('$1,500.00')
      expect(result.text).toContain('Positive savings')
      expect(result.type).toBe('success')
      expect(result.formatted).toBe(true)
    })

    it('should format financial summary with negative savings', () => {
      const result = service.formatFinancialSummary(
        3000,
        3500,
        -500,
        'This Month',
      )

      expect(result.text).toContain('Negative savings')
      expect(result.type).toBe('warning')
    })

    it('should calculate savings rate correctly', () => {
      const result = service.formatFinancialSummary(
        10000,
        7000,
        3000,
        'This Month',
      )

      expect(result.text).toContain('30.0%')
    })
  })

  describe('formatSpendingAnalysis', () => {
    it('should format spending analysis with category breakdown', () => {
      const categoryBreakdown = [
        { category: 'Food', amount: 500, percentage: 25 },
        { category: 'Transportation', amount: 300, percentage: 15 },
      ]

      const result = service.formatSpendingAnalysis(
        categoryBreakdown,
        2000,
        'This Month',
        'Food',
      )

      expect(result.text).toContain('Spending Analysis')
      expect(result.text).toContain('$2,000.00')
      expect(result.text).toContain('🏆 **Top Category:** Food')
      expect(result.text).toContain('🍽️ Food: $500.00 (25.0%)')
      expect(result.type).toBe('info')
    })

    it('should sort categories by amount descending', () => {
      const categoryBreakdown = [
        { category: 'Transportation', amount: 300, percentage: 15 },
        { category: 'Food', amount: 500, percentage: 25 },
      ]

      const result = service.formatSpendingAnalysis(
        categoryBreakdown,
        2000,
        'This Month',
      )

      const foodIndex = result.text.indexOf('Food: $500.00')
      const transportIndex = result.text.indexOf('Transportation: $300.00')
      expect(foodIndex).toBeLessThan(transportIndex)
    })
  })

  describe('formatTransactionList', () => {
    it('should format transaction list with income and expenses', () => {
      const transactions = [
        {
          type: 'income' as const,
          amount: 3000,
          description: 'Salary',
          category: 'Income',
          date: new Date('2024-01-15'),
        },
        {
          type: 'expense' as const,
          amount: 150,
          description: 'Grocery shopping',
          category: 'Food',
          date: new Date('2024-01-14'),
        },
      ]

      const result = service.formatTransactionList(transactions, 'Last 7 days')

      expect(result.text).toContain('Recent Transactions')
      expect(result.text).toContain('💰 +$3,000.00 - Salary')
      expect(result.text).toContain('💸 -$150.00 - Grocery shopping')
      expect(result.type).toBe('info')
    })

    it('should handle empty transaction list', () => {
      const result = service.formatTransactionList([], 'Last 7 days')

      expect(result.text).toContain('No transactions found')
      expect(result.type).toBe('info')
    })

    it('should limit to 10 transactions and show count', () => {
      const transactions = Array.from({ length: 15 }, (_, i) => ({
        type: 'expense' as const,
        amount: 100,
        description: `Transaction ${i + 1}`,
        date: new Date(),
      }))

      const result = service.formatTransactionList(transactions, 'Last 30 days')

      expect(result.text).toContain('... and 5 more transactions')
    })
  })

  describe('formatBudgetStatus', () => {
    it('should format budget status with different statuses', () => {
      const budgets = [
        {
          category: 'Food',
          spent: 400,
          budgeted: 500,
          remaining: 100,
          status: 'on_track' as const,
        },
        {
          category: 'Entertainment',
          spent: 300,
          budgeted: 200,
          remaining: -100,
          status: 'over_budget' as const,
        },
      ]

      const result = service.formatBudgetStatus(budgets, 'This Month')

      expect(result.text).toContain('Budget Status')
      expect(result.text).toContain('✅ **Food:**')
      expect(result.text).toContain('❌ **Entertainment:**')
      expect(result.text).toContain('1 on track, 1 over budget')
      expect(result.type).toBe('warning')
    })
  })

  describe('formatGoalProgress', () => {
    it('should format goal progress with different statuses', () => {
      const goals = [
        {
          description: 'Emergency Fund',
          current: 3000,
          target: 5000,
          progress: 60,
          status: 'on_track' as const,
          deadline: new Date('2024-12-31'),
        },
        {
          description: 'Vacation',
          current: 2000,
          target: 2000,
          progress: 100,
          status: 'completed' as const,
        },
      ]

      const result = service.formatGoalProgress(goals)

      expect(result.text).toContain('Savings Goals Progress')
      expect(result.text).toContain('📈 **Emergency Fund:**')
      expect(result.text).toContain('🎉 **Vacation:**')
      expect(result.text).toContain('60.0% complete')
      expect(result.text).toContain('100.0% complete')
      expect(result.text).toContain('1 goal(s) completed')
    })

    it('should handle empty goals list', () => {
      const result = service.formatGoalProgress([])

      expect(result.text).toContain('No savings goals found')
      expect(result.type).toBe('info')
    })
  })

  describe('formatAnomalyAlert', () => {
    it('should format anomaly alerts with different severities', () => {
      const anomalies = [
        {
          description: 'Unusual spending spike in entertainment',
          severity: 'high' as const,
          impact: 'Potential budget overrun',
          recommendation: 'Review recent transactions',
        },
        {
          description: 'Income deposit delay',
          severity: 'medium' as const,
          impact: 'Cash flow timing',
          recommendation: 'Contact employer',
        },
      ]

      const result = service.formatAnomalyAlert(anomalies)

      expect(result.text).toContain('Financial Anomalies Detected')
      expect(result.text).toContain('🚨 **HIGH**')
      expect(result.text).toContain('⚠️ **MEDIUM**')
      expect(result.text).toContain('2 unusual pattern(s)')
      expect(result.type).toBe('warning')
    })

    it('should handle no anomalies', () => {
      const result = service.formatAnomalyAlert([])

      expect(result.text).toContain('No anomalies detected')
      expect(result.type).toBe('success')
    })
  })

  describe('formatErrorResponse', () => {
    it('should format error response with suggestion', () => {
      const result = service.formatErrorResponse(
        'Unable to process request',
        'Please try again later',
      )

      expect(result.text).toContain('❌ **Error**')
      expect(result.text).toContain('Unable to process request')
      expect(result.text).toContain('💡 **Suggestion:** Please try again later')
      expect(result.type).toBe('error')
    })
  })

  describe('formatSuccessResponse', () => {
    it('should format success response with details', () => {
      const result = service.formatSuccessResponse(
        'Transaction completed successfully',
        'Your payment has been processed',
      )

      expect(result.text).toContain('✅ **Success**')
      expect(result.text).toContain('Transaction completed successfully')
      expect(result.text).toContain('Your payment has been processed')
      expect(result.type).toBe('success')
    })
  })

  describe('formatInfoResponse', () => {
    it('should format informational response', () => {
      const result = service.formatInfoResponse(
        'Budget updated',
        'Your monthly budget has been adjusted',
      )

      expect(result.text).toContain('ℹ️ **Information**')
      expect(result.text).toContain('Budget updated')
      expect(result.text).toContain('Your monthly budget has been adjusted')
      expect(result.type).toBe('info')
    })
  })

  describe('formatRawResponse', () => {
    it('should format raw text response', () => {
      const result = service.formatRawResponse('Raw response text')

      expect(result.text).toBe('Raw response text')
      expect(result.type).toBe('info')
      expect(result.formatted).toBe(false)
    })
  })

  describe('Currency formatting', () => {
    it('should use USD by default', () => {
      jest.spyOn(configService, 'get').mockReturnValue('USD')
      const result = service['formatCurrency'](1234.56)
      expect(result).toBe('$1,234.56')
    })

    it('should support different currencies', () => {
      jest.spyOn(configService, 'get').mockReturnValue('EUR')
      const result = service['formatCurrency'](1234.56)
      expect(result).toBe('€1,234.56')
    })
  })

  describe('Date formatting', () => {
    it('should format dates correctly', () => {
      const date = new Date('2024-01-15')
      const result = service['formatDate'](date)
      expect(result).toBe('Jan 15, 2024')
    })

    it('should handle string dates', () => {
      const result = service['formatDate']('2024-01-15')
      expect(result).toBe('Jan 15, 2024')
    })

    it('should handle undefined dates', () => {
      const result = service['formatDate'](undefined)
      expect(result).toBe('Unknown date')
    })
  })

  describe('Emoji helpers', () => {
    it('should return correct category emojis', () => {
      expect(service['getCategoryEmoji']('food')).toBe('🍽️')
      expect(service['getCategoryEmoji']('transportation')).toBe('🚗')
      expect(service['getCategoryEmoji']('unknown')).toBe('💰')
    })

    it('should return correct budget status emojis', () => {
      expect(service['getBudgetStatusEmoji']('on_track')).toBe('✅')
      expect(service['getBudgetStatusEmoji']('over_budget')).toBe('❌')
      expect(service['getBudgetStatusEmoji']('under_budget')).toBe('💰')
    })

    it('should return correct goal status emojis', () => {
      expect(service['getGoalStatusEmoji']('completed')).toBe('🎉')
      expect(service['getGoalStatusEmoji']('on_track')).toBe('📈')
      expect(service['getGoalStatusEmoji']('behind')).toBe('⚠️')
    })

    it('should return correct anomaly severity emojis', () => {
      expect(service['getAnomalySeverityEmoji']('high')).toBe('🚨')
      expect(service['getAnomalySeverityEmoji']('medium')).toBe('⚠️')
      expect(service['getAnomalySeverityEmoji']('low')).toBe('ℹ️')
    })
  })
})
