import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

export interface AiRequestLogContext {
  conv_id?: string
  turn_id?: string
  user_id?: number
  method: string
  url: string
  user_agent?: string
  ip: string
}

export interface AiResponseLogContext extends AiRequestLogContext {
  status_code: number
  response_time: number
  cache_hit?: boolean
  fallback_used?: boolean
  error?: string
}

@Injectable()
export class AiLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AiLoggingInterceptor.name)

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>()
    const response = context.switchToHttp().getResponse<Response>()
    const startTime = Date.now()

    // Extract request context
    const requestContext: AiRequestLogContext = {
      method: request.method,
      url: request.url,
      user_agent: request.get('User-Agent'),
      ip: request.ip || request.connection.remoteAddress || 'unknown',
    }

    // Add user ID if available
    if (
      request.user &&
      typeof request.user === 'object' &&
      'id' in request.user
    ) {
      requestContext.user_id = Number(request.user.id)
    }

    // Extract conversation ID from body or query params
    if (request.body?.conversationId) {
      requestContext.conv_id = request.body.conversationId
    } else if (request.query?.conversationId) {
      requestContext.conv_id = request.query.conversationId as string
    }

    // Generate turn ID for new requests
    if (request.method === 'POST' && request.url.includes('/message')) {
      requestContext.turn_id = this.generateTurnId()
    }

    this.logger.log('AI Request Started', {
      ...requestContext,
      timestamp: new Date().toISOString(),
    })

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - startTime
          const responseContext: AiResponseLogContext = {
            ...requestContext,
            status_code: response.statusCode,
            response_time: responseTime,
          }

          // Extract additional context from response data if available
          if (data && typeof data === 'object') {
            if (data.conversationId) {
              responseContext.conv_id = data.conversationId
            }
            if (data.cached !== undefined) {
              responseContext.cache_hit = data.cached
            }
            if (data.fallback !== undefined) {
              responseContext.fallback_used = data.fallback
            }
          }

          this.logger.log('AI Request Completed', {
            ...responseContext,
            timestamp: new Date().toISOString(),
          })
        },
        error: (error) => {
          const responseTime = Date.now() - startTime
          const responseContext: AiResponseLogContext = {
            ...requestContext,
            status_code: error.status || 500,
            response_time: responseTime,
            error: error.message || 'Unknown error',
          }

          this.logger.error('AI Request Failed', {
            ...responseContext,
            timestamp: new Date().toISOString(),
            stack: error.stack,
          })
        },
      }),
    )
  }

  /**
   * Generate a unique turn ID for logging purposes
   */
  private generateTurnId(): string {
    return `turn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}
