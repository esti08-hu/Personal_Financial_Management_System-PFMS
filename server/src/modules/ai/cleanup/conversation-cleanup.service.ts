import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ConversationContextManagerService } from '../context/conversation-context-manager.service'
import { ConversationRepository } from '../conversation/conversation.repository'

@Injectable()
export class ConversationCleanupService {
  private readonly logger = new Logger(ConversationCleanupService.name)

  constructor(
    private readonly contextManager: ConversationContextManagerService,
    private readonly conversationRepository: ConversationRepository,
  ) {}

  /**
   * Run periodic cleanup of old conversations and context
   * Runs daily at 2 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleScheduledCleanup(): Promise<void> {
    this.logger.log('Starting scheduled conversation cleanup')

    try {
      const cleanedContexts = await this.cleanupOldContexts()
      const cleanedConversations = await this.cleanupOldConversations()

      this.logger.log(
        `Scheduled cleanup completed: ${cleanedContexts} contexts cleaned, ${cleanedConversations} conversations archived`,
      )
    } catch (error) {
      this.logger.error('Error during scheduled cleanup:', error)
    }
  }

  /**
   * Clean up old conversation contexts from memory
   */
  async cleanupOldContexts(maxAgeHours: number = 48): Promise<number> {
    try {
      const cleanedCount = this.contextManager.cleanupOldConversations(maxAgeHours)
      this.logger.debug(`Cleaned up ${cleanedCount} old conversation contexts`)
      return cleanedCount
    } catch (error) {
      this.logger.error('Error cleaning up old contexts:', error)
      return 0
    }
  }

  /**
   * Clean up old conversations from database (soft delete/archive)
   * This implements the retention policy from data-model.md
   */
  async cleanupOldConversations(retentionDays: number = 30): Promise<number> {
    try {
      const archivedCount = await this.conversationRepository.archiveOldConversations(retentionDays)
      this.logger.debug(`Archived ${archivedCount} conversations older than ${retentionDays} days`)
      return archivedCount
    } catch (error) {
      this.logger.error('Error archiving old conversations:', error)
      return 0
    }
  }

  /**
   * Manual cleanup trigger (can be called from admin endpoints)
   */
  async performManualCleanup(): Promise<{
    contextsCleaned: number
    conversationsCleaned: number
  }> {
    this.logger.log('Performing manual conversation cleanup')

    const contextsCleaned = await this.cleanupOldContexts()
    const conversationsCleaned = await this.cleanupOldConversations()

    return {
      contextsCleaned,
      conversationsCleaned,
    }
  }

  /**
   * Get cleanup statistics
   */
  async getCleanupStats(): Promise<{
    activeContexts: number
    totalConversations: number
    oldConversationsCount: number
  }> {
    try {
      const activeContexts = this.contextManager.listConversations().length
      const totalConversations = await this.conversationRepository.getTotalConversations()
      const oldConversationsCount = await this.conversationRepository.getOldConversationsCount()

      return {
        activeContexts,
        totalConversations,
        oldConversationsCount,
      }
    } catch (error) {
      this.logger.error('Error getting cleanup stats:', error)
      return {
        activeContexts: 0,
        totalConversations: 0,
        oldConversationsCount: 0,
      }
    }
  }
}