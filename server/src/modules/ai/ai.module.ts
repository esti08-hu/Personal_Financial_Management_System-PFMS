import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { AggregationService } from './aggregation/aggregation.service'
import { AnomalyDetectionService } from './anomaly/anomaly-detection.service'
import { CacheService } from './caching/cache.service'
import { ConversationCleanupService } from './cleanup/conversation-cleanup.service'
import { ConversationContextManagerService } from './context/conversation-context-manager.service'
import { AiController } from './controller/ai.controller'
import { ConversationRepository } from './conversation/conversation.repository'
import { ResponseFormatterService } from './formatter/response-formatter.service'
import { GeminiClient } from './gemini/gemini-client.service'
import { IntentParser } from './intent/intent.parser'
import { AiLoggingInterceptor } from './interceptors/ai-logging.interceptor'
import { AiRequestMiddleware } from './middleware/ai-request.middleware'
import { ConversationOrchestratorService } from './orchestration/conversation-orchestrator.service'
import { RateLimitRepository } from './rate-limit/rate-limit.repository'
import { RateLimitService } from './rate-limit/rate-limit.service'

@Module({
  imports: [ConfigModule, ScheduleModule.forRoot()],
  controllers: [AiController],
  providers: [
    ConversationOrchestratorService,
    IntentParser,
    AggregationService,
    AnomalyDetectionService,
    CacheService,
    RateLimitService,
    RateLimitRepository,
    GeminiClient,
    ConversationRepository,
    ConversationContextManagerService,
    ConversationCleanupService,
    ResponseFormatterService,
    AiLoggingInterceptor,
  ],
  exports: [
    ConversationOrchestratorService,
    IntentParser,
    AggregationService,
    AnomalyDetectionService,
    CacheService,
    RateLimitService,
    RateLimitRepository,
    GeminiClient,
    ConversationRepository,
    ConversationContextManagerService,
    ConversationCleanupService,
    ResponseFormatterService,
  ],
})
export class AiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AiRequestMiddleware).forRoutes('ai')
  }
}
