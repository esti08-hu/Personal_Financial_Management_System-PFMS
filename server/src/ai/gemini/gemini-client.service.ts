import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export interface GeminiMessage {
  role: 'user' | 'model'
  parts: Array<{
    text?: string
    inlineData?: {
      mimeType: string
      data: string // base64 encoded
    }
  }>
}

export interface GeminiRequest {
  contents: GeminiMessage[]
  generationConfig?: {
    temperature?: number
    topK?: number
    topP?: number
    maxOutputTokens?: number
    stopSequences?: string[]
  }
  safetySettings?: Array<{
    category: string
    threshold: string
  }>
  systemInstruction?: {
    parts: Array<{
      text: string
    }>
  }
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      role: string
      parts: Array<{
        text?: string
        functionCall?: {
          name: string
          args: Record<string, any>
        }
      }>
    }
    finishReason: string
    index: number
    safetyRatings: Array<{
      category: string
      probability: string
    }>
  }>
  usageMetadata?: {
    promptTokenCount: number
    candidatesTokenCount: number
    totalTokenCount: number
  }
}

export interface GeminiError {
  code: number
  message: string
  status: string
}

export interface GeminiClientOptions {
  apiKey?: string
  model?: string
  temperature?: number
  maxTokens?: number
  timeout?: number
  retries?: number
  retryDelay?: number
}

export interface ChatRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
  }>
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
}

export interface ChatResponse {
  content: string
  finishReason: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  safetyRatings?: Array<{
    category: string
    probability: string
  }>
}

export class GeminiAPIError extends Error {
  constructor(
    message: string,
    public code: number,
    public status: string,
  ) {
    super(message)
    this.name = 'GeminiAPIError'
  }
}

export class GeminiRateLimitError extends GeminiAPIError {
  constructor(
    message: string,
    public retryAfter?: number,
  ) {
    super(message, 429, 'RESOURCE_EXHAUSTED')
    this.name = 'GeminiRateLimitError'
  }
}

export class GeminiSafetyError extends GeminiAPIError {
  constructor(message: string) {
    super(message, 400, 'INVALID_ARGUMENT')
    this.name = 'GeminiSafetyError'
  }
}

/**
 * Gemini AI Client Wrapper
 * Provides a clean interface for interacting with Google's Gemini AI API
 */
@Injectable()
export class GeminiClient {
  private readonly logger = new Logger(GeminiClient.name)
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta'
  private readonly defaultOptions: Required<GeminiClientOptions>

  constructor(private configService: ConfigService) {
    this.defaultOptions = {
      apiKey: this.configService.get('GEMINI_API_KEY', ''),
      model: this.configService.get('GEMINI_MODEL', 'gemini-1.5-flash'),
      temperature: this.configService.get('GEMINI_TEMPERATURE', 0.7),
      maxTokens: this.configService.get('GEMINI_MAX_TOKENS', 2048),
      timeout: this.configService.get('GEMINI_TIMEOUT', 30000),
      retries: this.configService.get('GEMINI_RETRIES', 3),
      retryDelay: this.configService.get('GEMINI_RETRY_DELAY', 1000),
    }

    if (!this.defaultOptions.apiKey) {
      throw new Error('GEMINI_API_KEY is required')
    }
  }

  /**
   * Send a chat request to Gemini
   */
  async chat(
    request: ChatRequest,
    options: Partial<GeminiClientOptions> = {},
  ): Promise<ChatResponse> {
    const config = { ...this.defaultOptions, ...options }
    const geminiRequest = this.buildGeminiRequest(request, config)

    let lastError: Error

    for (let attempt = 0; attempt <= config.retries; attempt++) {
      try {
        const response = await this.makeRequest(geminiRequest, config)
        return this.parseGeminiResponse(response)
      } catch (error) {
        lastError = error as Error

        if (error instanceof GeminiRateLimitError && attempt < config.retries) {
          const delay = config.retryDelay * Math.pow(2, attempt) // Exponential backoff
          this.logger.warn(
            `Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${config.retries + 1})`,
          )
          await this.delay(delay)
          continue
        }

        if (error instanceof GeminiAPIError && attempt < config.retries) {
          // Retry on server errors (5xx)
          if (error.code >= 500) {
            const delay = config.retryDelay * Math.pow(2, attempt)
            this.logger.warn(
              `Server error, retrying in ${delay}ms (attempt ${attempt + 1}/${config.retries + 1})`,
            )
            await this.delay(delay)
            continue
          }
        }

        // Don't retry on client errors or if max retries reached
        break
      }
    }

    // Wrap non-GeminiAPIError errors
    if (!(lastError instanceof GeminiAPIError)) {
      throw new GeminiAPIError(
        `Request failed: ${lastError.message}`,
        500,
        'INTERNAL_ERROR',
      )
    }

    throw lastError!
  }

  /**
   * Stream chat response (if supported by the model)
   */
  async *chatStream(
    request: ChatRequest,
    options: Partial<GeminiClientOptions> = {},
  ): AsyncGenerator<ChatResponse> {
    const config = { ...this.defaultOptions, ...options }
    const geminiRequest = this.buildGeminiRequest(request, config)

    try {
      const response = await fetch(
        `${this.baseUrl}/models/${config.model}:streamGenerateContent?key=${config.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(geminiRequest),
          signal: AbortSignal.timeout(config.timeout),
        },
      )

      if (!response.ok) {
        await this.handleErrorResponse(response)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new GeminiAPIError('No response body', 500, 'INTERNAL_ERROR')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')

          // Keep the last incomplete line in buffer
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line)
                if (data.candidates && data.candidates[0]) {
                  yield this.parseGeminiResponse(data)
                }
              } catch (parseError) {
                this.logger.warn(
                  'Failed to parse streaming response line:',
                  parseError,
                )
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    } catch (error) {
      if (error instanceof GeminiAPIError) {
        throw error
      }
      throw new GeminiAPIError(
        `Streaming request failed: ${error.message}`,
        500,
        'INTERNAL_ERROR',
      )
    }
  }

  /**
   * Check if the API key is valid
   */
  async validateApiKey(): Promise<boolean> {
    try {
      const testRequest: GeminiRequest = {
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Hello' }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 1,
        },
      }

      await this.makeRequest(testRequest, this.defaultOptions)
      return true
    } catch (error) {
      this.logger.error('API key validation failed:', error)
      return false
    }
  }

  /**
   * Get available models
   */
  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/models?key=${this.defaultOptions.apiKey}`,
        {
          signal: AbortSignal.timeout(this.defaultOptions.timeout),
        },
      )

      if (!response.ok) {
        await this.handleErrorResponse(response)
      }

      const data = await response.json()
      return data.models?.map((model: any) => model.name.split('/').pop()) || []
    } catch (error) {
      this.logger.error('Failed to list models:', error)
      throw error
    }
  }

  /**
   * Build Gemini API request from chat request
   */
  private buildGeminiRequest(
    request: ChatRequest,
    config: GeminiClientOptions,
  ): GeminiRequest {
    const contents: GeminiMessage[] = []

    // Add system instruction if provided
    let systemInstruction: GeminiRequest['systemInstruction']
    if (request.systemPrompt) {
      systemInstruction = {
        parts: [{ text: request.systemPrompt }],
      }
    }

    // Convert messages to Gemini format
    for (const message of request.messages) {
      if (message.role === 'system') {
        // System messages become part of system instruction
        if (systemInstruction) {
          systemInstruction.parts.push({ text: message.content })
        } else {
          systemInstruction = {
            parts: [{ text: message.content }],
          }
        }
      } else {
        contents.push({
          role: message.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: message.content }],
        })
      }
    }

    const geminiRequest: GeminiRequest = {
      contents,
      generationConfig: {
        temperature: request.temperature ?? config.temperature,
        maxOutputTokens: request.maxTokens ?? config.maxTokens,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      ],
    }

    if (systemInstruction) {
      geminiRequest.systemInstruction = systemInstruction
    }

    return geminiRequest
  }

  /**
   * Make HTTP request to Gemini API
   */
  private async makeRequest(
    request: GeminiRequest,
    config: GeminiClientOptions,
  ): Promise<GeminiResponse> {
    const url = `${this.baseUrl}/models/${config.model}:generateContent?key=${config.apiKey}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(config.timeout),
    })

    if (!response.ok) {
      await this.handleErrorResponse(response)
    }

    return await response.json()
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: GeminiError

    try {
      const responseData = await response.json()
      // Gemini API wraps errors in an "error" object
      if (responseData.error) {
        errorData = responseData.error
      } else {
        errorData = responseData
      }
    } catch {
      errorData = {
        code: response.status,
        message: response.statusText,
        status: 'UNKNOWN_ERROR',
      }
    }

    switch (response.status) {
      case 429:
        throw new GeminiRateLimitError(
          errorData.message || 'Rate limit exceeded',
          this.parseRetryAfter(response.headers.get('Retry-After')),
        )
      case 400:
        if (
          errorData.status === 'INVALID_ARGUMENT' &&
          errorData.message.toLowerCase().includes('safety')
        ) {
          throw new GeminiSafetyError(errorData.message)
        }
        throw new GeminiAPIError(
          errorData.message,
          errorData.code,
          errorData.status,
        )
      case 403:
        throw new GeminiAPIError(
          'API key invalid or unauthorized',
          403,
          'PERMISSION_DENIED',
        )
      case 404:
        throw new GeminiAPIError('Model not found', 404, 'NOT_FOUND')
      case 500:
      case 502:
      case 503:
        throw new GeminiAPIError(
          'Server error',
          response.status,
          'INTERNAL_ERROR',
        )
      default:
        throw new GeminiAPIError(
          errorData.message,
          errorData.code,
          errorData.status,
        )
    }
  }

  /**
   * Parse Gemini API response
   */
  private parseGeminiResponse(response: GeminiResponse): ChatResponse {
    if (!response.candidates || response.candidates.length === 0) {
      throw new GeminiAPIError('No response candidates', 500, 'NO_CANDIDATES')
    }

    const candidate = response.candidates[0]
    const content = candidate.content

    if (!content.parts || content.parts.length === 0) {
      throw new GeminiAPIError(
        'No content parts in response',
        500,
        'NO_CONTENT',
      )
    }

    const textPart = content.parts.find((part) => part.text)
    if (!textPart?.text) {
      throw new GeminiAPIError('No text content in response', 500, 'NO_TEXT')
    }

    return {
      content: textPart.text,
      finishReason: candidate.finishReason,
      usage: response.usageMetadata
        ? {
            promptTokens: response.usageMetadata.promptTokenCount,
            completionTokens: response.usageMetadata.candidatesTokenCount,
            totalTokens: response.usageMetadata.totalTokenCount,
          }
        : undefined,
      safetyRatings: candidate.safetyRatings,
    }
  }

  /**
   * Parse Retry-After header
   */
  private parseRetryAfter(retryAfter: string | null): number | undefined {
    if (!retryAfter) return undefined

    const seconds = parseInt(retryAfter, 10)
    return isNaN(seconds) ? undefined : seconds * 1000 // Convert to milliseconds
  }

  /**
   * Utility method for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
