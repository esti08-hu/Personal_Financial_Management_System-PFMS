import { IsNumber, IsString } from 'class-validator'

export class CreateTransactionDto {
  @IsNumber()
  userId: number
  @IsNumber()
  balance: number
  @IsNumber()
  accountId: number
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
  @IsNumber()
  accountId: number
  @IsNumber()
  amount: number
  @IsString()
  createdAt: string
  @IsString()
  description: string
  @IsNumber()
  balance: number
}

export class DeleteTransactionDto {
  @IsNumber()
  balance: number
  @IsNumber()
  accountId: number
}
