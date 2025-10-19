import { ApiProperty } from '@nestjs/swagger'

export class HealthResponseDto {
  @ApiProperty({
    description: 'Overall health status of the AI service',
    example: 'healthy',
    enum: ['healthy', 'degraded', 'unhealthy'],
  })
  status: 'healthy' | 'degraded' | 'unhealthy'

  @ApiProperty({
    description: 'Timestamp of the health check',
    example: '2024-01-15T10:30:00Z',
  })
  timestamp: Date

  @ApiProperty({
    description: 'Service uptime in milliseconds',
    example: 3600000,
  })
  uptime: number

  @ApiProperty({
    description: 'Version of the AI service',
    example: '1.0.0',
  })
  version: string

  @ApiProperty({
    description: 'Health status of individual components',
    example: {
      gemini: 'healthy',
      database: 'healthy',
      cache: 'healthy',
      rateLimit: 'healthy',
      contextManager: 'healthy',
      orchestrator: 'healthy',
      formatter: 'healthy',
    },
  })
  services: {
    gemini: 'healthy' | 'degraded' | 'unhealthy'
    database: 'healthy' | 'degraded' | 'unhealthy'
    cache: 'healthy' | 'degraded' | 'unhealthy'
    rateLimit: 'healthy' | 'degraded' | 'unhealthy'
    contextManager: 'healthy' | 'degraded' | 'unhealthy'
    orchestrator: 'healthy' | 'degraded' | 'unhealthy'
    formatter: 'healthy' | 'degraded' | 'unhealthy'
  }

  @ApiProperty({
    description: 'Performance metrics',
    example: {
      averageResponseTime: 1250,
      totalRequests: 150,
      activeConversations: 5,
      cacheHitRate: 0.75,
    },
  })
  metrics: {
    averageResponseTime: number
    totalRequests: number
    activeConversations: number
    cacheHitRate: number
  }

  @ApiProperty({
    description: 'Any issues or warnings',
    example: [],
    type: [String],
  })
  issues: string[]
}
