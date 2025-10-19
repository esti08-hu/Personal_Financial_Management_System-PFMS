import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsUUID } from 'class-validator'

export class ResetContextDto {
  @ApiProperty({
    description: 'Conversation ID to reset the context for',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'Conversation ID must be a valid UUID v4' })
  conversationId: string

  @ApiPropertyOptional({
    description: 'Whether to preserve system messages when resetting context',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'preserveSystemMessages must be a boolean' })
  preserveSystemMessages?: boolean = true
}

export class ResetContextResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Conversation context has been reset successfully.',
  })
  message: string

  @ApiProperty({
    description: 'The conversation ID that was reset',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  conversationId: string

  @ApiProperty({
    description: 'Number of messages removed from context',
    example: 15,
  })
  messagesRemoved: number

  @ApiProperty({
    description: 'Number of messages preserved in context',
    example: 2,
  })
  messagesPreserved: number

  @ApiProperty({
    description: 'Timestamp of the reset operation',
    example: '2024-01-15T10:30:00Z',
  })
  resetAt: Date
}
