import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import {
  ChatRequest,
  ChatResponse,
  GeminiAPIError,
  GeminiClient,
  GeminiRateLimitError,
  GeminiSafetyError,
} from './gemini-client.service'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

const mockConfigService = {
  get: jest.fn((key: string, defaultValue?: any) => {
    const config = {
      GEMINI_API_KEY: 'test-api-key',
      GEMINI_MODEL: 'gemini-1.5-flash',
      GEMINI_TEMPERATURE: 0.7,
      GEMINI_MAX_TOKENS: 2048,
      GEMINI_TIMEOUT: 30000,
      GEMINI_RETRIES: 3,
      GEMINI_RETRY_DELAY: 1000,
    }
    return config[key] || defaultValue
  }),
}

describe('GeminiClient', () => {
  let service: GeminiClient

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeminiClient,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile()

    service = module.get<GeminiClient>(GeminiClient)
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('chat', () => {
    const mockGeminiResponse = {
      candidates: [
        {
          content: {
            role: 'model',
            parts: [{ text: 'Hello, how can I help you?' }],
          },
          finishReason: 'STOP',
          index: 0,
          safetyRatings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              probability: 'NEGLIGIBLE',
            },
          ],
        },
      ],
      usageMetadata: {
        promptTokenCount: 10,
        candidatesTokenCount: 20,
        totalTokenCount: 30,
      },
    }

    it('should send chat request and return response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGeminiResponse),
      })

      const request: ChatRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
      }

      const result = await service.chat(request)

      expect(result.content).toBe('Hello, how can I help you?')
      expect(result.finishReason).toBe('STOP')
      expect(result.usage).toEqual({
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
      })
      expect(mockFetch).toHaveBeenCalledWith(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=test-api-key',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.any(String),
        }),
      )
    })

    it('should handle system prompts', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGeminiResponse),
      })

      const request: ChatRequest = {
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Hello' },
        ],
        systemPrompt: 'Be concise.',
      }

      await service.chat(request)

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(requestBody.systemInstruction.parts).toHaveLength(2)
      expect(requestBody.systemInstruction.parts[0].text).toBe('Be concise.')
      expect(requestBody.systemInstruction.parts[1].text).toBe(
        'You are a helpful assistant.',
      )
    })

    it('should handle custom options', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGeminiResponse),
      })

      const request: ChatRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        temperature: 0.5,
        maxTokens: 100,
      }

      await service.chat(request, { model: 'gemini-pro' })

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(requestBody.generationConfig.temperature).toBe(0.5)
      expect(requestBody.generationConfig.maxOutputTokens).toBe(100)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('models/gemini-pro:generateContent'),
        expect.any(Object),
      )
    })

    it('should retry on rate limit errors', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          headers: new Map([['retry-after', '1']]),
          json: () =>
            Promise.resolve({
              error: {
                code: 429,
                message: 'Rate limit exceeded',
                status: 'RESOURCE_EXHAUSTED',
              },
            }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGeminiResponse),
        })

      const request: ChatRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
      }

      const result = await service.chat(request)

      expect(result.content).toBe('Hello, how can I help you?')
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should retry on server errors', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: () =>
            Promise.resolve({
              error: {
                code: 500,
                message: 'Server error',
                status: 'INTERNAL_ERROR',
              },
            }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGeminiResponse),
        })

      const request: ChatRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
      }

      const result = await service.chat(request)

      expect(result.content).toBe('Hello, how can I help you?')
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should throw GeminiRateLimitError on rate limit', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        headers: new Map(),
        json: () =>
          Promise.resolve({
            error: {
              code: 429,
              message: 'Rate limit exceeded',
              status: 'RESOURCE_EXHAUSTED',
            },
          }),
      })

      const request: ChatRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
      }

      await expect(service.chat(request)).rejects.toThrow(GeminiRateLimitError)
    }, 10000)

    it('should throw GeminiSafetyError on safety violations', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: () =>
          Promise.resolve({
            error: {
              code: 400,
              message: 'Safety violation detected',
              status: 'INVALID_ARGUMENT',
            },
          }),
      })

      const request: ChatRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
      }

      await expect(service.chat(request)).rejects.toThrow(GeminiSafetyError)
    })

    it('should throw GeminiAPIError on other errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        json: () =>
          Promise.resolve({
            error: {
              code: 403,
              message: 'Unauthorized',
              status: 'PERMISSION_DENIED',
            },
          }),
      })

      const request: ChatRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
      }

      await expect(service.chat(request)).rejects.toThrow(GeminiAPIError)
      await expect(service.chat(request)).rejects.toThrow(
        'API key invalid or unauthorized',
      )
    })

    it('should handle malformed responses', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      })

      const request: ChatRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
      }

      await expect(service.chat(request)).rejects.toThrow(GeminiAPIError)
    }, 10000)

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const request: ChatRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
      }

      await expect(service.chat(request)).rejects.toThrow(GeminiAPIError)
    })
  })

  describe('chatStream', () => {
    it('should handle streaming responses', async () => {
      const streamData = [
        {
          candidates: [
            {
              content: { role: 'model', parts: [{ text: 'Hello' }] },
              finishReason: 'STOP',
              index: 0,
              safetyRatings: [],
            },
          ],
        },
        {
          candidates: [
            {
              content: { role: 'model', parts: [{ text: ' world!' }] },
              finishReason: 'STOP',
              index: 0,
              safetyRatings: [],
            },
          ],
        },
      ]

      const mockResponse = {
        ok: true,
        body: {
          getReader: () => ({
            read: jest
              .fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(
                  JSON.stringify(streamData[0]) + '\n',
                ),
              })
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(
                  JSON.stringify(streamData[1]) + '\n',
                ),
              })
              .mockResolvedValueOnce({ done: true, value: new Uint8Array() }),
            releaseLock: jest.fn(),
          }),
        },
      }

      mockFetch.mockResolvedValue(mockResponse)

      const request: ChatRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
      }

      const responses: ChatResponse[] = []
      for await (const response of service.chatStream(request)) {
        responses.push(response)
      }

      expect(responses).toHaveLength(2)
      expect(responses[0].content).toBe('Hello')
      expect(responses[1].content).toBe(' world!')
    })

    it('should handle streaming errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const request: ChatRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
      }

      await expect(async () => {
        for await (const _ of service.chatStream(request)) {
          // Should not reach here
        }
      }).rejects.toThrow(GeminiAPIError)
    })
  })

  describe('validateApiKey', () => {
    it('should return true for valid API key', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            candidates: [
              {
                content: { role: 'model', parts: [{ text: 'OK' }] },
                finishReason: 'STOP',
                index: 0,
                safetyRatings: [],
              },
            ],
          }),
      })

      const result = await service.validateApiKey()
      expect(result).toBe(true)
    })

    it('should return false for invalid API key', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        json: () =>
          Promise.resolve({
            error: {
              code: 403,
              message: 'Unauthorized',
              status: 'PERMISSION_DENIED',
            },
          }),
      })

      const result = await service.validateApiKey()
      expect(result).toBe(false)
    })
  })

  describe('listModels', () => {
    it('should return list of models', async () => {
      const mockModelsResponse = {
        models: [
          { name: 'models/gemini-1.5-flash' },
          { name: 'models/gemini-pro' },
        ],
      }

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockModelsResponse),
      })

      const models = await service.listModels()

      expect(models).toEqual(['gemini-1.5-flash', 'gemini-pro'])
    })

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () =>
          Promise.resolve({
            error: {
              code: 500,
              message: 'Server error',
              status: 'INTERNAL_ERROR',
            },
          }),
      })

      await expect(service.listModels()).rejects.toThrow(GeminiAPIError)
    })
  })

  describe('error classes', () => {
    it('should create GeminiAPIError correctly', () => {
      const error = new GeminiAPIError('Test error', 400, 'INVALID_ARGUMENT')
      expect(error.message).toBe('Test error')
      expect(error.code).toBe(400)
      expect(error.status).toBe('INVALID_ARGUMENT')
      expect(error.name).toBe('GeminiAPIError')
    })

    it('should create GeminiRateLimitError correctly', () => {
      const error = new GeminiRateLimitError('Rate limited', 5000)
      expect(error.message).toBe('Rate limited')
      expect(error.retryAfter).toBe(5000)
      expect(error.name).toBe('GeminiRateLimitError')
    })

    it('should create GeminiSafetyError correctly', () => {
      const error = new GeminiSafetyError('Safety violation')
      expect(error.message).toBe('Safety violation')
      expect(error.name).toBe('GeminiSafetyError')
    })
  })

  describe('initialization', () => {
    it('should throw error if API key is missing', () => {
      const configWithoutKey = {
        get: jest.fn(() => undefined),
      }

      expect(() => {
        ;new (GeminiClient as any)(configWithoutKey)
      }).toThrow('GEMINI_API_KEY is required')
    })
  })
})
