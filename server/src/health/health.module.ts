import { Module } from '@nestjs/common'
import { TerminusModule } from '@nestjs/terminus'
import { DatabaseModule } from '../database/database.module'
import { HealthController } from './health.controller'
import { DrizzleHealthIndicator } from './drizzle.health.indicator'

@Module({
  imports: [TerminusModule, DatabaseModule],
  providers: [DrizzleHealthIndicator],
  controllers: [HealthController],
})
export class HealthModule {}
