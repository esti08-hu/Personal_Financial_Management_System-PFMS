import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator'

export class ListHistoryDto {
  @ApiPropertyOptional({
    description:
      'Conversation ID to get history for. If not provided, returns all conversations for the user',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Conversation ID must be a valid UUID v4' })
  conversationId?: string

  @ApiPropertyOptional({
    description: 'Maximum number of conversation turns to return',
    example: 50,
    default: 50,
    minimum: 1,
    maximum: 200,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(200, { message: 'Limit cannot exceed 200' })
  limit?: number = 50

  @ApiPropertyOptional({
    description: 'Number of conversation turns to skip (for pagination)',
    example: 0,
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Offset must be an integer' })
  @Min(0, { message: 'Offset must be non-negative' })
  offset?: number = 0

  @ApiPropertyOptional({
    description:
      'Filter by message content (case-insensitive substring search)',
    example: 'budget',
  })
  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  search?: string
}

export class ConversationTurnDto {
  @ApiProperty({
    description: 'Unique identifier for this conversation turn',
    example: 'turn-123',
  })
  id: string

  @ApiProperty({
    description: 'The user message',
    example: 'How much did I spend on groceries?',
  })
  userMessage: string

  @ApiPropertyOptional({
    description: 'The AI assistant response',
    example: 'You spent $450 on groceries this month.',
  })
  assistantMessage?: string

  @ApiProperty({
    description: 'Whether this turn has been processed',
    example: true,
  })
  isProcessed: boolean

  @ApiProperty({
    description: 'Whether this was a fallback response',
    example: false,
  })
  isFallback: boolean

  @ApiProperty({
    description: 'Timestamp when the turn was created',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date

  @ApiPropertyOptional({
    description: 'Timestamp when the turn was processed',
    example: '2024-01-15T10:30:05Z',
  })
  processedAt?: Date
}

export class ConversationDto {
  @ApiProperty({
    description: 'Unique identifier for the conversation',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string

  @ApiProperty({
    description: 'User ID who owns this conversation',
    example: 123,
  })
  userId: string

  @ApiProperty({
    description: 'Timestamp when the conversation was created',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date

  @ApiProperty({
    description: 'Timestamp when the conversation was last updated',
    example: '2024-01-15T10:45:00Z',
  })
  updatedAt: Date

  @ApiProperty({
    description: 'Number of turns in this conversation',
    example: 5,
  })
  turnCount: number

  @ApiProperty({
    description: 'The conversation turns',
    type: [ConversationTurnDto],
  })
  turns: ConversationTurnDto[]
}

export class HistoryResponseDto {
  @ApiProperty({
    description: 'Array of conversations with their turns',
    type: [ConversationDto],
  })
  conversations: ConversationDto[]

  @ApiProperty({
    description: 'Total number of conversations found',
    example: 3,
  })
  totalConversations: number

  @ApiProperty({
    description: 'Total number of turns across all conversations',
    example: 15,
  })
  totalTurns: number

  @ApiProperty({
    description: 'Whether there are more results available (for pagination)',
    example: false,
  })
  hasMore: boolean
}
