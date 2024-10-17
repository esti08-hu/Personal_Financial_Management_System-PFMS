import { IsNumber, IsString } from 'class-validator'

export class CreateBudgetDto {
  @IsNumber()
  userId: number
  @IsString()
  title: string
  @IsString()
  type: string
  @IsNumber()
  amount: number
  @IsString()
  date: string
}

export class UpdateBudgetDto {
  @IsString()
  type: string
  @IsString()
  title: string
  @IsNumber()
  amount: number
  @IsString()
  date: string
}
