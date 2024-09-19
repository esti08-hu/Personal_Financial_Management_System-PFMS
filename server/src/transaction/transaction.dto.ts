import { IsNumber, IsString } from "class-validator";

export class CreateTransactionDto {
  @IsNumber()
  userId: number;
  @IsString()
  type: string;
  @IsNumber()
  amount: number;
  @IsString()
  date: string;
  @IsString()
  description: string;
}

export class UpdateTransactionDto {
  @IsString()
  type: string;
  @IsNumber()
  amount: number;
  @IsString()
  date: string;
  @IsString()
  description: string;
}

