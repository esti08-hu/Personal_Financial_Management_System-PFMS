import { Test, TestingModule } from '@nestjs/testing'
import { ConversationOrchestratorService } from './orchestration/conversation-orchestrator.service'
import { ConversationRepository } from './conversation/conversation.repository'
import { ConversationContextManagerService } from './context/conversation-context-manager.service'
import { ConversationCleanupService } from './cleanup/conversation-cleanup.service'
import { ConfigService } from '@nestjs/config'
import { DrizzleService } from '../database/drizzle.service'
import { IntentParser } from './intent/intent.parser'
import { AggregationService } from './aggregation/aggregation.service'
import { AnomalyDetectionService } from './anomaly/anomaly-detection.service'
import { CacheService } from './caching/cache.service'
import { RateLimitService } from './rate-limit/rate-limit.service'
import { GeminiClient } from './gemini/gemini-client.service'
import { ResponseFormatterService } from './formatter/response-formatter.service'

describe('Conversation Services Integration', () => {
  let orchestratorService: ConversationOrchestratorService
  let conversationRepository: ConversationRepository
  let contextManager: ConversationContextManagerService
  let cleanupService: ConversationCleanupService
  let module: TestingModule

  beforeEach(async () => {
    // Create a mock database service
    const mockDrizzleService = {
      db: {
        execute: jest.fn(),
        query: {
          conversation: {
            findFirst: jest.fn(),
            findMany: jest.fn(),
          },
          turn: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
          },
        },
      },
    }

    // Create mock services
    const mockConfigService = {
      get: jest.fn((key: string) => {
        const config = {
          AI_MAX_TOKENS: '2048',
          AI_CONTEXT_TURNS_MAX: '12',
        }
        return config[key]
      }),
    }

    const mockIntentParser = {
      parseIntent: jest.fn().mockReturnValue({
        query: 'test query',
        categories: ['groceries'],
        timeframe: { start: '2025-01-01', end: '2025-01-31' },
      }),
    }

    const mockAggregationService = {
      aggregateFinancialData: jest.fn().mockResolvedValue({
        totalExpenses: 500,
        categories: { groceries: 300 },
      }),
    }

    const mockAnomalyDetectionService = {
      detectAnomalies: jest.fn().mockResolvedValue([]),
    }

    const mockCacheService = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
    }

    const mockRateLimitService = {
      checkLimit: jest.fn().mockResolvedValue({ allowed: true }),
    }

    const mockGeminiClient = {
      chat: jest.fn().mockResolvedValue({
        content: 'This is a test AI response about your spending.',
      }),
    }

    const mockResponseFormatter = {
      formatRawResponse: jest.fn().mockReturnValue({
        text: 'This is a test AI response about your spending.',
        type: 'text',
      }),
      formatErrorResponse: jest.fn().mockReturnValue({
        text: '❌ **Error**\n\nI\'m sorry, I\'m experiencing technical difficulties right now.\n\n💡 **Suggestion:** Please try again later or contact support if the issue persists.',
        type: 'error',
        formatted: true,
      }),
    }

    module = await Test.createTestingModule({
      providers: [
        ConversationOrchestratorService,
        ConversationRepository,
        ConversationContextManagerService,
        ConversationCleanupService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: DrizzleService,
          useValue: mockDrizzleService,
        },
        {
          provide: IntentParser,
          useValue: mockIntentParser,
        },
        {
          provide: AggregationService,
          useValue: mockAggregationService,
        },
        {
          provide: AnomalyDetectionService,
          useValue: mockAnomalyDetectionService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
        {
          provide: RateLimitService,
          useValue: mockRateLimitService,
        },
        {
          provide: GeminiClient,
          useValue: mockGeminiClient,
        },
        {
          provide: ResponseFormatterService,
          useValue: mockResponseFormatter,
        },
      ],
    }).compile()

    orchestratorService = module.get<ConversationOrchestratorService>(
      ConversationOrchestratorService,
    )
    conversationRepository = module.get<ConversationRepository>(
      ConversationRepository,
    )
    contextManager = module.get<ConversationContextManagerService>(
      ConversationContextManagerService,
    )
    cleanupService = module.get<ConversationCleanupService>(
      ConversationCleanupService,
    )
  })

  afterEach(async () => {
    await module.close()
  })

  describe('Complete Conversation Workflow', () => {
    it('should create new conversation, process message, and persist turn', async () => {
      // Mock database operations
      const mockConversation = {
        id: 'test-conversation-id',
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        totalTurns: 0,
        isActive: true,
        lastActivityAt: new Date(),
      }

      jest
        .spyOn(conversationRepository, 'getConversationById')
        .mockResolvedValue(null) // No existing conversation

      jest
        .spyOn(conversationRepository, 'createConversation')
        .mockResolvedValue(mockConversation)

      jest
        .spyOn(conversationRepository, 'createTurn')
        .mockResolvedValue({
          id: 'test-turn-id',
          conversationId: 'test-conversation-id',
          userMessage: 'How much did I spend on groceries?',
          assistantMessage: 'This is a test AI response about your spending.',
          intent: { query: 'test' },
          aggregates: { total: 500 },
          isProcessed: true,
          isFallback: false,
          createdAt: new Date(),
          processedAt: new Date(),
        })

      // Process conversation
      const result = await orchestratorService.processConversation({
        userId: 1,
        conversationId: 'test-conversation-id',
        userMessage: 'How much did I spend on groceries?',
      })

      // Verify the result
      expect(result).toBeDefined()
      expect(result.response).toContain('test AI response')
      expect(result.intent).toBeDefined()
      expect(result.aggregates).toBeDefined()

      // Verify conversation was created
      expect(conversationRepository.createConversation).toHaveBeenCalledWith({
        userId: 1,
      })

      // Verify turn was persisted
      expect(conversationRepository.createTurn).toHaveBeenCalledWith(
        expect.objectContaining({
          conversationId: 'test-conversation-id',
          userMessage: 'How much did I spend on groceries?',
          assistantMessage: expect.stringContaining('test AI response'),
          isProcessed: true,
          isFallback: false,
        }),
      )

      // Verify context was managed
      const contextMessages = contextManager.getContextWindow(
        'test-conversation-id',
      )
      expect(contextMessages.length).toBeGreaterThan(0)
    })

    it('should load existing conversation and hydrate context', async () => {
      const existingConversation = {
        id: 'existing-conversation-id',
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        totalTurns: 1,
        isActive: true,
        lastActivityAt: new Date(),
        turns: [
          {
            id: 'existing-turn-id',
            conversationId: 'existing-conversation-id',
            userMessage: 'Previous question?',
            assistantMessage: 'Previous answer.',
            intent: null,
            aggregates: null,
            isProcessed: true,
            isFallback: false,
            createdAt: new Date(),
            processedAt: new Date(),
          },
        ],
      }

      jest
        .spyOn(conversationRepository, 'getConversationById')
        .mockResolvedValue(existingConversation)

      jest
        .spyOn(conversationRepository, 'createTurn')
        .mockResolvedValue({
          id: 'new-turn-id',
          conversationId: 'existing-conversation-id',
          userMessage: 'Follow up question?',
          assistantMessage: 'Follow up answer.',
          intent: { query: 'follow up' },
          aggregates: { total: 300 },
          isProcessed: true,
          isFallback: false,
          createdAt: new Date(),
          processedAt: new Date(),
        })

      // Process conversation with existing ID
      const result = await orchestratorService.processConversation({
        userId: 1,
        conversationId: 'existing-conversation-id',
        userMessage: 'Follow up question?',
      })

      // Verify conversation was loaded (not created)
      expect(conversationRepository.getConversationById).toHaveBeenCalledWith(
        'existing-conversation-id',
      )

      // Verify context was hydrated with existing messages
      const contextMessages = contextManager.getContextWindow(
        'existing-conversation-id',
      )
      expect(contextMessages.length).toBeGreaterThan(1) // Should include previous messages

      // Verify new turn was created
      expect(conversationRepository.createTurn).toHaveBeenCalled()
    })

    it('should handle context cleanup properly', async () => {
      // Create some test conversations in context manager
      contextManager.createConversation('old-conversation')
      contextManager.createConversation('new-conversation')

      // Mock the context manager cleanup method
      const cleanupSpy = jest.spyOn(contextManager, 'cleanupOldConversations')

      // Run cleanup
      const result = await cleanupService.performManualCleanup()

      // Verify cleanup was called
      expect(cleanupSpy).toHaveBeenCalledWith(48) // Default 48 hours

      // Verify result structure
      expect(result).toHaveProperty('contextsCleaned')
      expect(result).toHaveProperty('conversationsCleaned')
      expect(typeof result.contextsCleaned).toBe('number')
      expect(typeof result.conversationsCleaned).toBe('number')
    })

    it('should provide cleanup statistics', async () => {
      // Mock context manager methods
      jest
        .spyOn(contextManager, 'listConversations')
        .mockReturnValue(['conv1', 'conv2', 'conv3'])

      // Mock repository methods
      jest
        .spyOn(conversationRepository, 'getTotalConversations')
        .mockResolvedValue(5)

      jest
        .spyOn(conversationRepository, 'getOldConversationsCount')
        .mockResolvedValue(2)

      const stats = await cleanupService.getCleanupStats()

      expect(stats).toEqual({
        activeContexts: 3,
        totalConversations: 5,
        oldConversationsCount: 2,
      })
    })

    it('should handle errors gracefully in conversation processing', async () => {
      // Mock repository to throw error
      jest
        .spyOn(conversationRepository, 'getConversationById')
        .mockRejectedValue(new Error('Database connection failed'))

      // Process should still work (with fallback behavior)
      const result = await orchestratorService.processConversation({
        userId: 1,
        conversationId: 'test-conversation-id',
        userMessage: 'Test message',
      })

      // Should still return a result (fallback response)
      expect(result).toBeDefined()
      expect(result.fallback).toBe(true)
    })
  })

  describe('Service Integration Validation', () => {
    it('should ensure all three services work together without conflicts', async () => {
      // This test verifies that the services can be instantiated and work together
      expect(orchestratorService).toBeDefined()
      expect(conversationRepository).toBeDefined()
      expect(contextManager).toBeDefined()
      expect(cleanupService).toBeDefined()

      // Verify that context manager is properly injected into orchestrator
      expect(orchestratorService).toHaveProperty('contextManager')

      // Verify that repository is properly injected into orchestrator
      expect(orchestratorService).toHaveProperty('conversationRepository')
    })

    it('should maintain conversation state across multiple interactions', async () => {
      const conversationId = 'multi-turn-test'

      // Mock database operations
      jest
        .spyOn(conversationRepository, 'getConversationById')
        .mockResolvedValue(null)

      jest
        .spyOn(conversationRepository, 'createConversation')
        .mockResolvedValue({
          id: conversationId,
          userId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          totalTurns: 0,
          isActive: true,
          lastActivityAt: new Date(),
        })

      jest
        .spyOn(conversationRepository, 'createTurn')
        .mockResolvedValue({
          id: 'turn-1',
          conversationId,
          userMessage: 'First message',
          assistantMessage: 'First response',
          intent: { query: 'first' },
          aggregates: { total: 100 },
          isProcessed: true,
          isFallback: false,
          createdAt: new Date(),
          processedAt: new Date(),
        })

      // First interaction
      await orchestratorService.processConversation({
        userId: 1,
        conversationId,
        userMessage: 'First message',
      })

      // Verify context has the first message
      let contextMessages = contextManager.getContextWindow(conversationId)
      expect(contextMessages.length).toBeGreaterThan(0)

      // Mock for second interaction (conversation now exists)
      const existingConversation = {
        id: conversationId,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        totalTurns: 1,
        isActive: true,
        lastActivityAt: new Date(),
        turns: [
          {
            id: 'turn-1',
            conversationId,
            userMessage: 'First message',
            assistantMessage: 'First response',
            intent: null,
            aggregates: null,
            isProcessed: true,
            isFallback: false,
            createdAt: new Date(),
            processedAt: new Date(),
          },
        ],
      }

      jest
        .spyOn(conversationRepository, 'getConversationById')
        .mockResolvedValue(existingConversation)

      jest
        .spyOn(conversationRepository, 'createTurn')
        .mockResolvedValue({
          id: 'turn-2',
          conversationId,
          userMessage: 'Second message',
          assistantMessage: 'Second response',
          intent: { query: 'second' },
          aggregates: { total: 200 },
          isProcessed: true,
          isFallback: false,
          createdAt: new Date(),
          processedAt: new Date(),
        })

      // Second interaction
      await orchestratorService.processConversation({
        userId: 1,
        conversationId,
        userMessage: 'Second message',
      })

      // Verify context now has both interactions
      contextMessages = contextManager.getContextWindow(conversationId)
      expect(contextMessages.length).toBeGreaterThan(1)

      // Verify two turns were created
      expect(conversationRepository.createTurn).toHaveBeenCalledTimes(2)
    })
  })
})