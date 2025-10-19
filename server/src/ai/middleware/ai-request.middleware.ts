import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

@Injectable()
export class AiRequestMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AiRequestMiddleware.name)
  private readonly maxRequestSize = 1024 * 1024 // 1MB limit for AI requests

  use(req: Request, res: Response, next: NextFunction): void {
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('X-XSS-Protection', '1; mode=block')

    // Add caching headers for AI responses (short cache for dynamic content)
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 'private, max-age=300') // 5 minutes cache
    } else {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    }

    // Validate request size for POST requests
    if (req.method === 'POST') {
      const contentLength = parseInt(req.headers['content-length'] || '0', 10)
      if (contentLength > this.maxRequestSize) {
        this.logger.warn(
          `Request size ${contentLength} exceeds limit ${this.maxRequestSize}`,
        )
        res.status(413).json({
          error: 'Request Entity Too Large',
          message: `Request size exceeds maximum allowed size of ${this.maxRequestSize} bytes`,
        })
        return
      }
    }

    // Add request ID for tracing
    const requestId =
      req.headers['x-request-id'] ||
      `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    res.setHeader('X-Request-ID', requestId)

    // Log request details
    this.logger.debug(
      `AI Request: ${req.method} ${req.path} - Size: ${req.headers['content-length'] || 0} bytes`,
    )

    next()
  }
}
