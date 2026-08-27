import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import {
  ConversationContext,
  ConversationContextManagerService,
  ConversationMessage,
} from './conversation-context-manager.service'

describe('ConversationContextManagerService', () => {
  let service: ConversationContextManagerService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationContextManagerService,
        {
          provide: ConfigService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<ConversationContextManagerService>(
      ConversationContextManagerService,
    )
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('createConversation', () => {
    it('should create a new conversation context', () => {
      const conversationId = 'test-conversation'
      const metadata = { userId: 'user123' }

      const context = service.createConversation(conversationId, metadata)

      expect(context).toBeDefined()
      expect(context.conversationId).toBe(conversationId)
      expect(context.messages).toEqual([])
      expect(context.metadata).toEqual(metadata)
      expect(context.createdAt).toBeInstanceOf(Date)
      expect(context.updatedAt).toBeInstanceOf(Date)
    })

    it('should create conversation without metadata', () => {
      const conversationId = 'test-conversation-2'

      const context = service.createConversation(conversationId)

      expect(context).toBeDefined()
      expect(context.conversationId).toBe(conversationId)
      expect(context.metadata).toBeUndefined()
    })
  })

  describe('getConversation', () => {
    it('should return conversation context if exists', () => {
      const conversationId = 'existing-conversation'
      service.createConversation(conversationId)

      const context = service.getConversation(conversationId)

      expect(context).toBeDefined()
      expect(context?.conversationId).toBe(conversationId)
    })

    it('should return null for non-existent conversation', () => {
      const context = service.getConversation('non-existent')

      expect(context).toBeNull()
    })
  })

  describe('addMessage', () => {
    it('should add a message to existing conversation', () => {
      const conversationId = 'test-conversation'
      service.createConversation(conversationId)

      const message = service.addMessage(conversationId, 'user', 'Hello world')

      expect(message).toBeDefined()
      expect(message.role).toBe('user')
      expect(message.content).toBe('Hello world')
      expect(message.id).toBeDefined()
      expect(message.timestamp).toBeInstanceOf(Date)

      const context = service.getConversation(conversationId)
      expect(context?.messages).toHaveLength(1)
      expect(context?.messages[0]).toBe(message)
    })

    it('should create conversation if it does not exist', () => {
      const conversationId = 'new-conversation'

      const message = service.addMessage(conversationId, 'user', 'Hello world')

      expect(message).toBeDefined()
      const context = service.getConversation(conversationId)
      expect(context).toBeDefined()
      expect(context?.messages).toHaveLength(1)
    })

    it('should add message with metadata', () => {
      const conversationId = 'test-conversation'
      const metadata = { intent: 'greeting' }

      const message = service.addMessage(
        conversationId,
        'user',
        'Hello',
        metadata,
      )

      expect(message.metadata).toEqual(metadata)
    })

    it('should apply context window management', () => {
      const conversationId = 'test-conversation'
      service.createConversation(conversationId)

      // Add many messages to trigger context window management
      for (let i = 0; i < 60; i++) {
        service.addMessage(conversationId, 'user', `Message ${i}`)
      }

      const context = service.getConversation(conversationId)
      // Should be limited by maxMessages (50)
      expect(context?.messages.length).toBeLessThanOrEqual(50)
    })
  })

  describe('getContextWindow', () => {
    it('should return empty array for non-existent conversation', () => {
      const messages = service.getContextWindow('non-existent')

      expect(messages).toEqual([])
    })

    it('should return all messages for small conversation', () => {
      const conversationId = 'test-conversation'
      service.createConversation(conversationId)
      service.addMessage(conversationId, 'user', 'Hello')
      service.addMessage(conversationId, 'assistant', 'Hi there')

      const messages = service.getContextWindow(conversationId)

      expect(messages).toHaveLength(2)
      expect(messages[0].content).toBe('Hello')
      expect(messages[1].content).toBe('Hi there')
    })

    it('should respect maxMessages limit', () => {
      const conversationId = 'test-conversation'
      service.createConversation(conversationId)

      for (let i = 0; i < 60; i++) {
        service.addMessage(conversationId, 'user', `Message ${i}`)
      }

      const messages = service.getContextWindow(conversationId, {
        maxMessages: 10,
      })

      expect(messages).toHaveLength(10)
    })

    it('should preserve system messages when configured', () => {
      const conversationId = 'test-conversation'
      service.createConversation(conversationId)

      service.addMessage(
        conversationId,
        'system',
        'You are a helpful assistant',
      )
      for (let i = 0; i < 55; i++) {
        service.addMessage(conversationId, 'user', `Message ${i}`)
      }

      const messages = service.getContextWindow(conversationId, {
        maxMessages: 10,
        preserveSystemMessages: true,
      })

      const systemMessages = messages.filter((m) => m.role === 'system')
      expect(systemMessages).toHaveLength(1)
      expect(systemMessages[0].content).toBe('You are a helpful assistant')
    })

    it('should filter messages by age', () => {
      const conversationId = 'test-conversation'
      service.createConversation(conversationId)

      // Add an old message (simulate by directly modifying)
      const oldMessage: ConversationMessage = {
        id: 'old-msg',
        role: 'user',
        content: 'Old message',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 48 hours ago
      }
      const context = service.getConversation(conversationId)
      context?.messages.push(oldMessage)

      service.addMessage(conversationId, 'user', 'New message')

      const messages = service.getContextWindow(conversationId, {
        maxAgeHours: 24,
      })

      // Should not include the old message
      expect(messages.some((m) => m.id === 'old-msg')).toBe(false)
      expect(messages.some((m) => m.content === 'New message')).toBe(true)
    })
  })

  describe('clearConversation', () => {
    it('should clear existing conversation', () => {
      const conversationId = 'test-conversation'
      service.createConversation(conversationId)
      service.addMessage(conversationId, 'user', 'Hello')

      const cleared = service.clearConversation(conversationId)

      expect(cleared).toBe(true)
      expect(service.getConversation(conversationId)).toBeNull()
    })

    it('should return false for non-existent conversation', () => {
      const cleared = service.clearConversation('non-existent')

      expect(cleared).toBe(false)
    })
  })

  describe('getConversationStats', () => {
    it('should return null for non-existent conversation', () => {
      const stats = service.getConversationStats('non-existent')

      expect(stats).toBeNull()
    })

    it('should return null for empty conversation', () => {
      const conversationId = 'empty-conversation'
      service.createConversation(conversationId)

      const stats = service.getConversationStats(conversationId)

      expect(stats).toBeNull()
    })

    it('should return correct statistics', () => {
      const conversationId = 'test-conversation'
      service.createConversation(conversationId)

      const startTime = new Date()
      service.addMessage(conversationId, 'user', 'Hello world')
      service.addMessage(
        conversationId,
        'assistant',
        'Hi there! How can I help?',
      )

      const stats = service.getConversationStats(conversationId)

      expect(stats).toBeDefined()
      expect(stats?.messageCount).toBe(2)
      expect(stats?.totalTokens).toBeGreaterThan(0)
      expect(stats?.oldestMessage).toBeInstanceOf(Date)
      expect(stats?.newestMessage).toBeInstanceOf(Date)
      expect(stats?.oldestMessage.getTime()).toBeGreaterThanOrEqual(
        startTime.getTime(),
      )
    })
  })

  describe('listConversations', () => {
    it('should return empty array when no conversations', () => {
      const conversations = service.listConversations()

      expect(conversations).toEqual([])
    })

    it('should return all conversation IDs', () => {
      service.createConversation('conv1')
      service.createConversation('conv2')
      service.createConversation('conv3')

      const conversations = service.listConversations()

      expect(conversations).toHaveLength(3)
      expect(conversations).toContain('conv1')
      expect(conversations).toContain('conv2')
      expect(conversations).toContain('conv3')
    })
  })

  describe('cleanupOldConversations', () => {
    it('should remove old conversations', () => {
      // Create conversations
      service.createConversation('recent')
      service.createConversation('old')

      // Simulate old conversation by modifying updatedAt
      const oldContext = service.getConversation('old')
      if (oldContext) {
        oldContext.updatedAt = new Date(Date.now() - 72 * 60 * 60 * 1000) // 72 hours ago
      }

      const cleanedCount = service.cleanupOldConversations(48) // 48 hours threshold

      expect(cleanedCount).toBe(1)
      expect(service.getConversation('recent')).toBeDefined()
      expect(service.getConversation('old')).toBeNull()
    })

    it('should not remove recent conversations', () => {
      service.createConversation('recent')

      const cleanedCount = service.cleanupOldConversations(48)

      expect(cleanedCount).toBe(0)
      expect(service.getConversation('recent')).toBeDefined()
    })
  })

  describe('context window management', () => {
    it('should limit messages by token count', () => {
      const conversationId = 'test-conversation'
      service.createConversation(conversationId)

      // Add messages with varying lengths
      service.addMessage(conversationId, 'user', 'Short message')
      service.addMessage(conversationId, 'user', 'A'.repeat(1000)) // Long message
      service.addMessage(conversationId, 'user', 'Another short message')

      const messages = service.getContextWindow(conversationId, {
        maxTokens: 100,
      })

      // Should prioritize recent messages within token limit
      expect(messages.length).toBeGreaterThan(0)
      expect(messages.length).toBeLessThanOrEqual(3)
    })

    it('should maintain chronological order', () => {
      const conversationId = 'test-conversation'
      service.createConversation(conversationId)

      service.addMessage(conversationId, 'user', 'First')
      service.addMessage(conversationId, 'assistant', 'Second')
      service.addMessage(conversationId, 'user', 'Third')

      const messages = service.getContextWindow(conversationId)

      expect(messages[0].content).toBe('First')
      expect(messages[1].content).toBe('Second')
      expect(messages[2].content).toBe('Third')
    })
  })
})
