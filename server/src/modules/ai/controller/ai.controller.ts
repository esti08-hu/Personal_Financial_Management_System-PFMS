import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { randomUUID } from 'crypto'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Public } from '../../auth/guards/auth.decorators'
import { AuthGuard } from '../../auth/guards/auth.guard'
import { ConversationContextManagerService } from '../context/conversation-context-manager.service'
import { ConversationRepository } from '../conversation/conversation.repository'
import {
  ConversationDto,
  CreateMessageDto,
  HealthResponseDto,
  HistoryResponseDto,
  ListHistoryDto,
  MessageResponseDto,
  ResetContextDto,
  ResetContextResponseDto,
} from '../dto'
import { AiLoggingInterceptor } from '../interceptors/ai-logging.interceptor'
import { ConversationOrchestratorService } from '../orchestration/conversation-orchestrator.service'

@ApiTags('AI Conversation')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(AuthGuard)
@UseInterceptors(AiLoggingInterceptor)
export class AiController {
  private readonly logger = new Logger(AiController.name)

  constructor(
    private readonly orchestratorService: ConversationOrchestratorService,
    private readonly conversationRepository: ConversationRepository,
    private readonly contextManager: ConversationContextManagerService,
    private readonly configService: ConfigService,
  ) {}

  @Post('message')
  @ApiOperation({
    summary: 'Send a message to the AI assistant',
    description:
      'Process a user message through the AI conversation system and return a response.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Message processed successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Rate limit exceeded',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async createMessage(
    @Body() createMessageDto: CreateMessageDto,
    @Request() req: any,
  ): Promise<MessageResponseDto> {
    try {
      const userId = req.user.id
      const userPid = req.user.pid
      console.log(`User ID: ${userId}, User PID: ${userPid}`)
      this.logger.debug(
        `Processing message for user ${userId} (PID: ${userPid}): [MESSAGE CONTENT REDACTED FOR PRIVACY]`,
      )

      // Generate conversation ID if not provided
      const conversationId =
        createMessageDto.conversationId || this.generateConversationId()

      const result = await this.orchestratorService.processConversation({
        userId,
        conversationId,
        userMessage: createMessageDto.message,
        forceRefresh: createMessageDto.forceRefresh,
        skipCache: createMessageDto.skipCache,
      })

      this.logger.debug(
        `Message processed successfully for user ${userId} in ${result.processingTime}ms`,
      )

      return {
        response: result.response,
        conversationId,
        cached: result.cached,
        fallback: result.fallback,
        processingTime: result.processingTime,
        intent: result.intent,
        aggregates: result.aggregates,
        anomalies: result.anomalies,
        formattedResponse: result.formattedResponse,
      }
    } catch (error) {
      this.logger.error(
        `Error processing message for user ${req.user.id}:`,
        error,
      )

      if (error.message?.includes('Rate limit exceeded')) {
        throw new HttpException(
          'Rate limit exceeded. Please wait before sending another message.',
          HttpStatus.TOO_MANY_REQUESTS,
        )
      }

      if (error instanceof HttpException) {
        throw error
      }

      throw new HttpException(
        'An error occurred while processing your message. Please try again.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Get('history')
  @ApiOperation({
    summary: 'Get conversation history',
    description: 'Retrieve conversation history for the authenticated user.',
  })
  @ApiQuery({
    name: 'conversationId',
    required: false,
    description: 'Filter by specific conversation ID',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of conversations to return',
    type: Number,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of conversations to skip',
    type: Number,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search filter for message content',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'History retrieved successfully',
    type: HistoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  async getHistory(
    @Query() query: ListHistoryDto,
    @Request() req: any,
  ): Promise<HistoryResponseDto> {
    try {
      const userId = req.user.id

      this.logger.debug(
        `Retrieving history for user ${userId} with filters:`,
        query,
      )

      let conversations: any[] = []
      let totalConversations = 0
      let totalTurns = 0

      if (query.conversationId) {
        // Get specific conversation with all turns
        const conversation =
          await this.conversationRepository.getConversationById(
            query.conversationId,
          )
        if (conversation && conversation.userId === userId) {
          conversations = [this.mapConversationToDto(conversation)]
          totalConversations = 1
          totalTurns = conversation.totalTurns
        }
      } else {
        // Get user's conversations with pagination
        const userConversations =
          await this.conversationRepository.getUserConversations(
            userId,
            query.limit,
            query.offset,
          )

        conversations = userConversations.map((conv) =>
          this.mapConversationToDto(conv),
        )
        totalConversations = conversations.length

        // Get total turns count
        const stats =
          await this.conversationRepository.getUserConversationStats(userId)
        totalTurns = stats.totalTurns
      }

      // Apply search filter if provided
      if (query.search) {
        conversations = conversations.filter((conv) =>
          conv.turns.some(
            (turn) =>
              turn.userMessage
                .toLowerCase()
                .includes(query.search!.toLowerCase()) ||
              (turn.assistantMessage &&
                turn.assistantMessage
                  .toLowerCase()
                  .includes(query.search!.toLowerCase())),
          ),
        )
        totalConversations = conversations.length
      }

      const hasMore = totalConversations > query.limit!

      return {
        conversations,
        totalConversations,
        totalTurns,
        hasMore,
      }
    } catch (error) {
      this.logger.error(
        `Error retrieving history for user ${req.user.id}:`,
        error,
      )
      throw new HttpException(
        'An error occurred while retrieving conversation history.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Post('reset')
  @ApiOperation({
    summary: 'Reset conversation context',
    description: 'Reset the conversation context for a specific conversation.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Context reset successfully',
    type: ResetContextResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid conversation ID',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  async resetContext(
    @Body() resetContextDto: ResetContextDto,
    @Request() req: any,
  ): Promise<ResetContextResponseDto> {
    try {
      const userId = req.user.id

      this.logger.debug(
        `Resetting context for conversation ${resetContextDto.conversationId} by user ${userId}`,
      )

      // Get current conversation stats before clearing
      const statsBefore = this.contextManager.getConversationStats(
        resetContextDto.conversationId,
      )
      const messagesBefore = statsBefore ? statsBefore.messageCount : 0

      // Clear the conversation context
      const cleared = this.contextManager.clearConversation(
        resetContextDto.conversationId,
      )

      if (!cleared) {
        throw new HttpException(
          'Conversation not found or already cleared.',
          HttpStatus.NOT_FOUND,
        )
      }

      // Mark conversation as truncated in database for record keeping
      await this.conversationRepository.markConversationTruncated(
        resetContextDto.conversationId,
      )

      const messagesRemoved = messagesBefore
      const messagesPreserved = resetContextDto.preserveSystemMessages ? 0 : 0 // System messages are already cleared

      this.logger.log(
        `Successfully reset context for conversation ${resetContextDto.conversationId}, removed ${messagesRemoved} messages`,
      )

      return {
        message: 'Conversation context has been reset successfully.',
        conversationId: resetContextDto.conversationId,
        messagesRemoved,
        messagesPreserved,
        resetAt: new Date(),
      }
    } catch (error) {
      this.logger.error(
        `Error resetting context for user ${req.user.id}:`,
        error,
      )

      if (error instanceof HttpException) {
        throw error
      }

      throw new HttpException(
        'An error occurred while resetting conversation context.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Get('health')
  @Public()
  @ApiOperation({
    summary: 'Get AI service health status',
    description: 'Check the health status of all AI service components.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Health status retrieved successfully',
    type: HealthResponseDto,
  })
  async getHealth(): Promise<HealthResponseDto> {
    try {
      this.logger.debug('Retrieving AI service health status')

      const now = new Date()
      const uptime = process.uptime() * 1000 // Convert to milliseconds

      // Check individual service health
      const services = await this.checkServiceHealth()

      // Determine overall status
      const overallStatus = this.determineOverallStatus(services)

      // Get metrics
      const metrics = await this.getHealthMetrics()

      // Get issues
      const issues = this.getHealthIssues(services)

      return {
        status: overallStatus,
        timestamp: now,
        uptime,
        version: this.configService.get<string>('npm_package_version', '1.0.0'),
        services,
        metrics,
        issues,
      }
    } catch (error) {
      this.logger.error('Error retrieving health status:', error)
      throw new HttpException(
        'An error occurred while retrieving health status.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  /**
   * Generate a unique conversation ID using UUID v4
   */
  private generateConversationId(): string {
    return randomUUID()
  }

  /**
   * Map conversation repository data to DTO format
   */
  private mapConversationToDto(conversation: any): ConversationDto {
    return {
      id: conversation.id,
      userId: conversation.userId,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      turnCount: conversation.totalTurns,
      turns: conversation.turns.map((turn: any) => ({
        id: turn.id,
        userMessage: turn.userMessage,
        assistantMessage: turn.assistantMessage,
        isProcessed: turn.isProcessed,
        isFallback: turn.isFallback,
        createdAt: turn.createdAt,
        processedAt: turn.processedAt,
      })),
    }
  }

  /**
   * Check health of individual AI services
   */
  private async checkServiceHealth(): Promise<HealthResponseDto['services']> {
    const services: HealthResponseDto['services'] = {
      gemini: 'healthy',
      database: 'healthy',
      cache: 'healthy',
      rateLimit: 'healthy',
      contextManager: 'healthy',
      orchestrator: 'healthy',
      formatter: 'healthy',
    }

    // Check database connectivity
    try {
      await this.conversationRepository.getUserConversationStats()
    } catch (error) {
      services.database = 'unhealthy'
    }

    // Check context manager
    try {
      const testConversationId = 'health-check-test'
      this.contextManager.createConversation(testConversationId)
      this.contextManager.clearConversation(testConversationId)
    } catch (error) {
      services.contextManager = 'unhealthy'
    }

    // Other services are assumed healthy for now
    // In a production system, you would add actual health checks

    return services
  }

  /**
   * Determine overall health status based on individual services
   */
  private determineOverallStatus(
    services: HealthResponseDto['services'],
  ): 'healthy' | 'degraded' | 'unhealthy' {
    const serviceStatuses = Object.values(services)
    const unhealthyCount = serviceStatuses.filter(
      (status) => status === 'unhealthy',
    ).length
    const degradedCount = serviceStatuses.filter(
      (status) => status === 'degraded',
    ).length

    if (unhealthyCount > 0) {
      return 'unhealthy'
    } else if (degradedCount > 0) {
      return 'degraded'
    } else {
      return 'healthy'
    }
  }

  /**
   * Get health metrics
   */
  private async getHealthMetrics(): Promise<HealthResponseDto['metrics']> {
    try {
      // Get conversation statistics
      const conversationStats =
        await this.conversationRepository.getUserConversationStats() // Use undefined as we want global stats

      // Get context manager stats
      const activeConversations = this.contextManager.listConversations().length

      return {
        averageResponseTime: 0, // Would need to track this in a real implementation
        totalRequests: conversationStats.totalTurns,
        activeConversations,
        cacheHitRate: 0, // Would need to track this in cache service
      }
    } catch (error) {
      this.logger.warn('Error getting health metrics:', error)
      return {
        averageResponseTime: 0,
        totalRequests: 0,
        activeConversations: 0,
        cacheHitRate: 0,
      }
    }
  }

  /**
   * Get list of health issues
   */
  private getHealthIssues(services: HealthResponseDto['services']): string[] {
    const issues: string[] = []

    Object.entries(services).forEach(([service, status]) => {
      if (status === 'unhealthy') {
        issues.push(`${service} service is unhealthy`)
      } else if (status === 'degraded') {
        issues.push(`${service} service is degraded`)
      }
    })

    return issues
  }
}
