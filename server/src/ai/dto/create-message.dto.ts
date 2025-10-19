import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator'

export class CreateMessageDto {
  @ApiProperty({
    description: 'The user message to send to the AI assistant',
    example: 'What is my spending on groceries this month?',
    minLength: 1,
    maxLength: 2000,
  })
  @IsString()
  @MinLength(1, { message: 'Message cannot be empty' })
  @MaxLength(2000, { message: 'Message cannot exceed 2000 characters' })
  message: string

  @ApiPropertyOptional({
    description:
      'Optional conversation ID. If not provided, a new conversation will be created',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Conversation ID must be a valid UUID v4' })
  conversationId?: string

  @ApiPropertyOptional({
    description: 'Force refresh the response, bypassing cache',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'forceRefresh must be a boolean' })
  forceRefresh?: boolean

  @ApiPropertyOptional({
    description: 'Skip caching this response',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'skipCache must be a boolean' })
  skipCache?: boolean
}

export class MessageResponseDto {
  @ApiProperty({
    description: 'The AI assistant response message',
    example:
      'Based on your transactions, you spent $450 on groceries this month.',
  })
  response: string

  @ApiProperty({
    description: 'The conversation ID for this exchange',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  conversationId: string

  @ApiProperty({
    description: 'Whether the response came from cache',
    example: false,
  })
  cached: boolean

  @ApiProperty({
    description: 'Whether this was a fallback response due to an error',
    example: false,
  })
  fallback: boolean

  @ApiProperty({
    description: 'Processing time in milliseconds',
    example: 1250,
  })
  processingTime: number

  @ApiPropertyOptional({
    description: 'Intent analysis result',
  })
  intent?: any

  @ApiPropertyOptional({
    description: 'Aggregated financial data used in the response',
  })
  aggregates?: any

  @ApiPropertyOptional({
    description: 'Any anomalies detected in the financial data',
  })
  anomalies?: any[]

  @ApiPropertyOptional({
    description: 'Formatted response metadata',
  })
  formattedResponse?: any
}
