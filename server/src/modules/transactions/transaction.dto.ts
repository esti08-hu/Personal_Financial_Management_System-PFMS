import { Transform } from 'class-transformer'
import { IsNumber, IsString } from 'class-validator'

export class CreateTransactionDto {
  @IsString()
  userId: string
  @IsNumber()
  balance: number
  @IsString()
  accountId: string
  @IsString()
  type: string
  @IsNumber()
  amount: number
  @IsString()
  createdAt: string
  @IsString()
  description: string
}

export class UpdateTransactionDto {
  @IsString()
  type: string

  @IsString()
  accountId: string

  @Transform(({ value }) => Number(value))
  @IsNumber()
  amount: number

  @IsString()
  createdAt: string

  @IsString()
  description: string

  @Transform(({ value }) => Number(value))
  @IsNumber()
  balance: number
}
