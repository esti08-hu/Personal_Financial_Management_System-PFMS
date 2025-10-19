import { Injectable } from '@nestjs/common'
import { and, asc, count, desc, eq, sql } from 'drizzle-orm'
import { databaseSchema } from '../../database/database-schema'
import { DrizzleService } from '../../database/drizzle.service'

export interface CreateConversationData {
  userId: string
}

export interface CreateTurnData {
  conversationId: string
  userMessage: string
  assistantMessage?: string
  intent?: any
  aggregates?: any
  isProcessed?: boolean
  isFallback?: boolean
}

export interface UpdateTurnData {
  assistantMessage?: string
  intent?: any
  aggregates?: any
  isProcessed?: boolean
  isFallback?: boolean
  processedAt?: Date
}

export interface ConversationWithTurns {
  id: string
  userId: string
  createdAt: Date
  updatedAt: Date
  totalTurns: number
  isActive: boolean
  lastActivityAt: Date
  turns: Array<{
    id: string
    userMessage: string
    assistantMessage: string | null
    intent: any
    aggregates: any
    isProcessed: boolean
    isFallback: boolean
    createdAt: Date
    processedAt: Date | null
  }>
}

@Injectable()
export class ConversationRepository {
  constructor(private drizzle: DrizzleService) {}

  /**
   * Create a new conversation
   */
  async createConversation(data: CreateConversationData) {
    const result = await this.drizzle.db.execute(sql`
      INSERT INTO "Conversation" ("user_id", "total_turns", "is_active", "last_activity_at")
      VALUES (${data.userId}, 0, true, ${new Date().toISOString()})
      RETURNING *
    `)

    return result.rows[0]
  }

  /**
   * Get conversation by ID with turns
   */
  async getConversationById(
    conversationId: string,
  ): Promise<ConversationWithTurns | null> {
    const conversation = await this.drizzle.db.query.conversation.findFirst({
      where: eq(databaseSchema.conversation.id, conversationId),
      with: {
        turns: {
          orderBy: asc(databaseSchema.turn.createdAt),
        },
      },
    })

    return conversation as ConversationWithTurns | null
  }

  /**
   * Get conversations for a user
   */
  async getUserConversations(userId: string, limit = 10, offset = 0) {
    return await this.drizzle.db.query.conversation.findMany({
      where: eq(databaseSchema.conversation.userId, userId),
      orderBy: desc(databaseSchema.conversation.lastActivityAt),
      limit,
      offset,
      with: {
        turns: {
          orderBy: desc(databaseSchema.turn.createdAt),
          limit: 1, // Only get the latest turn for preview
        },
      },
    })
  }

  /**
   * Create a new turn in a conversation
   */
  async createTurn(data: CreateTurnData) {
    const result = await this.drizzle.db.execute(sql`
      INSERT INTO "Turn" ("conversation_id", "user_message", "assistant_message", "intent", "aggregates", "is_processed", "is_fallback")
      VALUES (${data.conversationId}, ${data.userMessage}, ${data.assistantMessage || null}, ${data.intent ? JSON.stringify(data.intent) : null}, ${data.aggregates ? JSON.stringify(data.aggregates) : null}, ${data.isProcessed ?? false}, ${data.isFallback ?? false})
      RETURNING *
    `)

    // Update conversation's total turns and last activity
    await this.drizzle.db.execute(sql`
      UPDATE "Conversation"
      SET "total_turns" = "total_turns" + 1, "updatedAt" = ${new Date().toISOString()}, "last_activity_at" = ${new Date().toISOString()}
      WHERE "id" = ${data.conversationId}
    `)

    return result.rows[0]
  }

  /**
   * Update a turn
   */
  async updateTurn(turnId: string, data: UpdateTurnData) {
    const updateData: any = {}

    if (data.assistantMessage !== undefined) {
      updateData.assistantMessage = data.assistantMessage
    }
    if (data.intent !== undefined) {
      updateData.intent = data.intent
    }
    if (data.aggregates !== undefined) {
      updateData.aggregates = data.aggregates
    }
    if (data.isProcessed !== undefined) {
      updateData.isProcessed = data.isProcessed
    }
    if (data.isFallback !== undefined) {
      updateData.isFallback = data.isFallback
    }
    if (data.processedAt !== undefined) {
      updateData.processedAt = data.processedAt
    }

    const result = await this.drizzle.db
      .update(databaseSchema.turn)
      .set(updateData)
      .where(eq(databaseSchema.turn.id, turnId))
      .returning()

    return result[0]
  }

  /**
   * Get turns for a conversation with pagination
   */
  async getConversationTurns(conversationId: string, page = 1, pageSize = 50) {
    const offset = (page - 1) * pageSize

    const [turns, totalCount] = await Promise.all([
      this.drizzle.db.query.turn.findMany({
        where: eq(databaseSchema.turn.conversationId, conversationId),
        orderBy: desc(databaseSchema.turn.createdAt),
        limit: pageSize,
        offset,
      }),
      this.drizzle.db
        .select({ count: count() })
        .from(databaseSchema.turn)
        .where(eq(databaseSchema.turn.conversationId, conversationId)),
    ])

    return {
      turns,
      pagination: {
        page,
        pageSize,
        total: totalCount[0]?.count || 0,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / pageSize),
      },
    }
  }

  /**
   * Mark conversation as truncated (for context management)
   */
  async markConversationTruncated(conversationId: string) {
    await this.drizzle.db.execute(sql`
      UPDATE "Conversation"
      SET "is_active" = false, "updatedAt" = ${new Date().toISOString()}
      WHERE "id" = ${conversationId}
    `)
  }

  /**
   * Delete a conversation and all its turns
   */
  async deleteConversation(conversationId: string) {
    // Delete turns first due to foreign key constraint
    await this.drizzle.db
      .delete(databaseSchema.turn)
      .where(eq(databaseSchema.turn.conversationId, conversationId))

    // Then delete the conversation
    const result = await this.drizzle.db
      .delete(databaseSchema.conversation)
      .where(eq(databaseSchema.conversation.id, conversationId))

    return result.rowCount > 0
  }

  /**
   * Get conversation statistics for a user
   */
  async getUserConversationStats(userId?: string) {
    const conditions = userId ? [eq(databaseSchema.conversation.userId, userId)] : []

    const [stats] = await this.drizzle.db
      .select({
        totalConversations: count(databaseSchema.conversation.id),
        activeConversations: sql<number>`COUNT(CASE WHEN ${databaseSchema.conversation.isActive} = true THEN 1 END)`,
        totalTurns: sql<number>`COALESCE(SUM(${databaseSchema.conversation.totalTurns}), 0)`,
      })
      .from(databaseSchema.conversation)
      .where(and(...conditions))

    return stats
  }

  /**
   * Get the latest turn for a conversation
   */
  async getLatestTurn(conversationId: string) {
    return await this.drizzle.db.query.turn.findFirst({
      where: eq(databaseSchema.turn.conversationId, conversationId),
      orderBy: desc(databaseSchema.turn.createdAt),
    })
  }

  /**
   * Archive old conversations (mark as inactive) after retention period
   * Returns the number of conversations archived
   */
  async archiveOldConversations(retentionDays: number = 30): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

    const result = await this.drizzle.db.execute(sql`
      UPDATE "Conversation"
      SET "is_active" = false, "updatedAt" = ${new Date().toISOString()}
      WHERE "is_active" = true AND "last_activity_at" < ${cutoffDate.toISOString()}
    `)

    return result.rowCount
  }

  /**
   * Get total count of conversations across all users
   */
  async getTotalConversations(): Promise<number> {
    const [result] = await this.drizzle.db
      .select({ count: count() })
      .from(databaseSchema.conversation)

    return result?.count || 0
  }

  /**
   * Get count of conversations older than retention period
   */
  async getOldConversationsCount(retentionDays: number = 30): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

    const [result] = await this.drizzle.db
      .select({ count: count() })
      .from(databaseSchema.conversation)
      .where(
        and(
          eq(databaseSchema.conversation.isActive, true),
          sql`${databaseSchema.conversation.lastActivityAt} < ${cutoffDate}`,
        ),
      )

    return result?.count || 0
  }

  /**
   * Hard delete conversations that have been inactive for extended period (90+ days)
   * This is for permanent cleanup after extended retention
   */
  async hardDeleteOldConversations(extendedRetentionDays: number = 90): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - extendedRetentionDays)

    // First delete all turns for conversations that will be deleted
    await this.drizzle.db.execute(sql`
      DELETE FROM "Turn"
      WHERE "conversation_id" IN (
        SELECT "id" FROM "Conversation"
        WHERE "is_active" = false AND "last_activity_at" < ${cutoffDate.toISOString()}
      )
    `)

    // Then delete the conversations
    const result = await this.drizzle.db.execute(sql`
      DELETE FROM "Conversation"
      WHERE "is_active" = false AND "last_activity_at" < ${cutoffDate.toISOString()}
    `)

    return result.rowCount
  }
}
