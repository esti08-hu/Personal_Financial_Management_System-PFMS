import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { PaginationDto } from './pagination.dto'

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class TransactionFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  type?: string

  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsString()
  dateFrom?: string

  @IsOptional()
  @IsString()
  dateTo?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  amountMin?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  amountMax?: number

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt'

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC
}

export class BudgetFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  type?: string

  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt'

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC
}

export class AccountFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  type?: string

  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt'

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC
}

export class UserFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt'

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC
}
