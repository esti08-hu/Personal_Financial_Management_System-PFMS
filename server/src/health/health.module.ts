import { Module } from '@nestjs/common'
import { TerminusModule } from '@nestjs/terminus'
import { HealthController } from './health.controller'
import { DrizzleHealthIndicator } from './drizzle.health.indicator'

@Module({
  imports: [TerminusModule],
  providers: [DrizzleHealthIndicator],
  controllers: [HealthController],
})
export class HealthModule {}
