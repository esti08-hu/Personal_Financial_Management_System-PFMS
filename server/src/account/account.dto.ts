import { IsNumber, IsString } from "class-validator";

export class CreateAccountDto {
  @IsNumber()
  userId: number;
  @IsString()
  title: string;
  @IsString()
  type: string;
  @IsNumber()
  balance: number;
}

export class UpdateAccountDto {
  @IsString()
  type: string;
  @IsString()
  title: string;
  @IsNumber()
  balance: number;
}
