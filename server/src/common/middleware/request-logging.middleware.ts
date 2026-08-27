import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP')

  use(request: Request, response: Response, next: NextFunction): void {
    const startedAt = Date.now()

    response.on('finish', () => {
      const duration = Date.now() - startedAt
      const message = `${request.method} ${request.originalUrl} ${response.statusCode} ${duration}ms`

      if (response.statusCode >= 500) {
        this.logger.error(message)
      } else if (response.statusCode >= 400) {
        this.logger.warn(message)
      } else {
        this.logger.log(message)
      }
    })

    next()
  }
}
