import { Test, TestingModule } from '@nestjs/testing'
import {
  FallbackContext,
  FallbackResponse,
  FallbackResponseBuilder,
} from './fallback-response-builder.service'

describe('FallbackResponseBuilder', () => {
  let service: FallbackResponseBuilder

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FallbackResponseBuilder],
    }).compile()

    service = module.get<FallbackResponseBuilder>(FallbackResponseBuilder)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('buildCriticalQueryResponse', () => {
    it('should handle balance inquiries', () => {
      const context: FallbackContext = {
        userId: 1,
        userMessage: 'What is my account balance?',
        intent: {
          query: 'balance',
          originalQuery: 'What is my account balance?',
        },
      }

      // Access private method for testing
      const result = (service as any).buildCriticalQueryResponse(context)

      expect(result).toBeDefined()
      expect(result?.type).toBe('deterministic')
      expect(result?.confidence).toBeGreaterThanOrEqual(0.9)
      expect(result?.response).toContain('account balance')
      expect(result?.response).toContain('support@financialapp.com')
    })

    it('should handle security-related queries', () => {
      const context: FallbackContext = {
        userId: 1,
        userMessage: 'I forgot my password',
        intent: { query: 'password', originalQuery: 'I forgot my password' },
      }

      const result = (service as any).buildCriticalQueryResponse(context)

      expect(result).toBeDefined()
      expect(result?.type).toBe('deterministic')
      expect(result?.confidence).toBe(0.95)
      expect(result?.response).toContain('security')
      expect(result?.response).toContain('secure.financialapp.com')
    })

    it('should handle account deletion requests', () => {
      const context: FallbackContext = {
        userId: 1,
        userMessage: 'Delete my account',
        intent: { query: 'delete account', originalQuery: 'Delete my account' },
      }

      const result = (service as any).buildCriticalQueryResponse(context)

      expect(result).toBeDefined()
      expect(result?.type).toBe('deterministic')
      expect(result?.confidence).toBe(0.95)
      expect(result?.response).toContain('account deletion')
      expect(result?.response).toContain('verification')
    })

    it('should return null for non-critical queries', () => {
      const context: FallbackContext = {
        userId: 1,
        userMessage: 'How much did I spend on food?',
        intent: {
          query: 'spending food',
          originalQuery: 'How much did I spend on food?',
        },
      }

      const result = (service as any).buildCriticalQueryResponse(context)

      expect(result).toBeNull()
    })
  })

  describe('buildIntentBasedResponse', () => {
    it('should handle spending analysis queries', () => {
      const context: FallbackContext = {
        userId: 1,
        userMessage: 'How much did I spend this month?',
        intent: {
          query: 'spending month',
          originalQuery: 'How much did I spend this month?',
          timeframe: {
            start: new Date(),
            end: new Date(),
            label: 'this month',
          },
        },
      }

      const result = (service as any).buildIntentBasedResponse(context)

      expect(result).toBeDefined()
      expect(result?.type).toBe('simplified')
      expect(result?.confidence).toBe(0.7)
      expect(result?.response).toContain('Analytics')
      expect(result?.response).toContain('spending analysis')
    })

    it('should handle budget check queries', () => {
      const context: FallbackContext = {
        userId: 1,
        userMessage: 'Am I over budget?',
        intent: {
          query: 'budget check',
          originalQuery: 'Am I over budget?',
        },
      }

      const result = (service as any).buildIntentBasedResponse(context)

      expect(result).toBeDefined()
      expect(result?.type).toBe('simplified')
      expect(result?.response).toContain('Budget')
      expect(result?.response).toContain('budget status')
    })

    it('should include timeframe information', () => {
      const context: FallbackContext = {
        userId: 1,
        userMessage: 'Show me last week transactions',
        intent: {
          query: 'transactions last week',
          originalQuery: 'Show me last week transactions',
          timeframe: {
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            end: new Date(),
            label: 'last week',
          },
        },
      }

      const result = (service as any).buildIntentBasedResponse(context)

      expect(result).toBeDefined()
      expect(result?.response).toContain('last week')
    })

    it('should return null for critical intents', () => {
      const context: FallbackContext = {
        userId: 1,
        userMessage: 'What is my balance?',
        intent: {
          query: 'balance',
          originalQuery: 'What is my balance?',
        },
      }

      // Mock isCriticalIntent to return true
      jest.spyOn(service as any, 'isCriticalIntent').mockReturnValue(true)

      const result = (service as any).buildIntentBasedResponse(context)

      expect(result).toBeNull()
    })
  })

  describe('buildErrorRecoveryResponse', () => {
    it('should handle rate limit errors', () => {
      const context: FallbackContext = {
        userId: 1,
        userMessage: 'Test message',
        intent: { query: 'test', originalQuery: 'Test message' },
        error: new Error('Rate limit exceeded'),
      }

      const result = (service as any).buildErrorRecoveryResponse(context)

      expect(result).toBeDefined()
      expect(result.type).toBe('error_recovery')
      expect(result.confidence).toBe(0.8)
      expect(result.response).toContain('too many requests')
    })

    it('should handle timeout errors', () => {
      const context: FallbackContext = {
        userId: 1,
        userMessage: 'Test message',
        intent: { query: 'test', originalQuery: 'Test message' },
        error: new Error('Request timeout'),
      }

      const result = (service as any).buildErrorRecoveryResponse(context)

      expect(result).toBeDefined()
      expect(result.type).toBe('error_recovery')
      expect(result.confidence).toBe(0.7)
      expect(result.response).toContain('taking longer than expected')
    })

    it('should handle AI service errors', () => {
      const context: FallbackContext = {
        userId: 1,
        userMessage: 'Test message',
        intent: { query: 'test', originalQuery: 'Test message' },
        error: new Error('AI model unavailable'),
      }

      const result = (service as any).buildErrorRecoveryResponse(context)

      expect(result).toBeDefined()
      expect(result.type).toBe('error_recovery')
      expect(result.confidence).toBe(0.7)
      expect(result.response).toContain(
        'AI assistant is temporarily unavailable',
      )
    })

    it('should handle unknown errors', () => {
      const context: FallbackContext = {
        userId: 1,
        userMessage: 'Test message',
        intent: { query: 'test', originalQuery: 'Test message' },
        error: new Error('Unknown error occurred'),
      }

      const result = (service as any).buildErrorRecoveryResponse(context)

      expect(result).toBeDefined()
      expect(result.type).toBe('error_recovery')
      expect(result.confidence).toBe(0.5)
      expect(result.response).toContain('technical difficulties')
    })

    it('should handle no error context', () => {
      const context: FallbackContext = {
        userId: 1,
        userMessage: 'Test message',
        intent: { query: 'test', originalQuery: 'Test message' },
      }

      const result = (service as any).buildErrorRecoveryResponse(context)

      expect(result).toBeDefined()
      expect(result.type).toBe('error_recovery')
      expect(result.confidence).toBe(0.5)
    })
  })

  describe('buildGenericFallbackResponse', () => {
    it('should return a generic fallback response', () => {
      const context: FallbackContext = {
        userId: 1,
        userMessage: 'Test message',
        intent: { query: 'test', originalQuery: 'Test message' },
      }

      const result = (service as any).buildGenericFallbackResponse(context)

      expect(result).toBeDefined()
      expect(result.type).toBe('error_recovery')
      expect(result.confidence).toBe(0.3)
      expect(result.response).toBeDefined()
      expect(typeof result.response).toBe('string')
      expect(result.response.length).toBeGreaterThan(0)
    })
  })

  describe('buildFallbackResponse', () => {
    it('should prioritize critical query responses', () => {
      const context: FallbackContext = {
        userId: 1,
        userMessage: 'What is my account balance?',
        intent: {
          query: 'balance',
          originalQuery: 'What is my account balance?',
        },
      }

      const result = service.buildFallbackResponse(context)

      expect(result.type).toBe('deterministic')
      expect(result.confidence).toBeGreaterThanOrEqual(0.9)
    })

    it('should fall back to intent-based responses', () => {
      const context: FallbackContext = {
        userId: 1,
        userMessage: 'How much did I spend on food?',
        intent: {
          query: 'spending food',
          originalQuery: 'How much did I spend on food?',
          categories: ['Food & Dining'],
        },
      }

      const result = service.buildFallbackResponse(context)

      expect(result.type).toBe('simplified')
      expect(result.confidence).toBe(0.7)
    })

    it('should fall back to error recovery when strategies fail', () => {
      const context: FallbackContext = {
        userId: 1,
        userMessage: 'Some random query that should fail all strategies',
        intent: {
          query: 'random',
          originalQuery: 'Some random query that should fail all strategies',
        },
        error: new Error('Test error'),
      }

      // Mock all strategies to return null
      jest
        .spyOn(service as any, 'buildCriticalQueryResponse')
        .mockReturnValue(null)
      jest
        .spyOn(service as any, 'buildIntentBasedResponse')
        .mockReturnValue(null)

      const result = service.buildFallbackResponse(context)

      expect(result.type).toBe('error_recovery')
      expect(result.confidence).toBe(0.5)
    })
  })

  describe('helper methods', () => {
    describe('isCriticalIntent', () => {
      it('should identify critical intents', () => {
        const criticalIntents = [
          { query: 'balance', originalQuery: 'check balance' },
          { query: 'security', originalQuery: 'security issue' },
          { query: 'delete account', originalQuery: 'delete my account' },
        ]

        criticalIntents.forEach((intent) => {
          expect((service as any).isCriticalIntent(intent)).toBe(true)
        })
      })

      it('should identify non-critical intents', () => {
        const nonCriticalIntents = [
          { query: 'spending', originalQuery: 'how much did I spend' },
          { query: 'budget', originalQuery: 'check budget' },
          { query: 'transactions', originalQuery: 'show transactions' },
        ]

        nonCriticalIntents.forEach((intent) => {
          expect((service as any).isCriticalIntent(intent)).toBe(false)
        })
      })
    })

    describe('classifyQueryType', () => {
      it('should classify spending queries', () => {
        expect(
          (service as any).classifyQueryType('How much did I spend?'),
        ).toBe('spending_analysis')
        expect((service as any).classifyQueryType('Show my expenses')).toBe(
          'spending_analysis',
        )
      })

      it('should classify budget queries', () => {
        expect((service as any).classifyQueryType('Am I over budget?')).toBe(
          'budget_check',
        )
        expect((service as any).classifyQueryType('Check my budget')).toBe(
          'budget_check',
        )
      })

      it('should classify transaction queries', () => {
        expect((service as any).classifyQueryType('Show my transactions')).toBe(
          'transaction_history',
        )
        expect((service as any).classifyQueryType('Transaction history')).toBe(
          'transaction_history',
        )
      })

      it('should return general for unknown queries', () => {
        expect((service as any).classifyQueryType('Some random query')).toBe(
          'general',
        )
      })
    })

    describe('getTimeframeDescription', () => {
      it('should describe single day as today', () => {
        const now = new Date()
        const timeframe = {
          start: now,
          end: new Date(now.getTime() + 24 * 60 * 60 * 1000),
          label: 'today',
        }

        expect((service as any).getTimeframeDescription(timeframe)).toBe(
          'today',
        )
      })

      it('should describe week timeframe', () => {
        const now = new Date()
        const timeframe = {
          start: now,
          end: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          label: 'this week',
        }

        expect((service as any).getTimeframeDescription(timeframe)).toBe(
          'this week',
        )
      })
    })

    describe('classifyError', () => {
      it('should classify rate limit errors', () => {
        expect(
          (service as any).classifyError(new Error('Rate limit exceeded')),
        ).toBe('rate_limit')
      })

      it('should classify timeout errors', () => {
        expect(
          (service as any).classifyError(new Error('Request timed out')),
        ).toBe('timeout')
      })

      it('should classify network errors', () => {
        expect(
          (service as any).classifyError(
            new Error('Network connection failed'),
          ),
        ).toBe('network')
      })

      it('should classify AI service errors', () => {
        expect(
          (service as any).classifyError(new Error('Gemini model unavailable')),
        ).toBe('ai_service')
      })

      it('should return general for unknown errors', () => {
        expect((service as any).classifyError(new Error('Unknown error'))).toBe(
          'general',
        )
      })

      it('should handle null errors', () => {
        expect((service as any).classifyError(null)).toBe('unknown')
      })
    })
  })

  describe('getFallbackStats', () => {
    it('should return fallback statistics', () => {
      const stats = service.getFallbackStats()

      expect(stats).toBeDefined()
      expect(stats).toHaveProperty('totalFallbacks')
      expect(stats).toHaveProperty('byType')
      expect(stats).toHaveProperty('byErrorType')
      expect(stats).toHaveProperty('averageConfidence')
    })
  })
})
