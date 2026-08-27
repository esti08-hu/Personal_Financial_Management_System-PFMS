import { Injectable } from '@nestjs/common'
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus'
import { sql } from 'drizzle-orm'
import { DrizzleService } from '../database/drizzle.service'

@Injectable()
export class DrizzleHealthIndicator extends HealthIndicator {
  constructor(private readonly drizzleService: DrizzleService) {
    super()
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.drizzleService.db.execute(sql`SELECT 1`)
      return this.getStatus(key, true)
    } catch (error) {
      return this.getStatus(key, false, {
        message: error instanceof Error ? error.message : 'Database connectivity check failed',
      })
    }
  }
}
