import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNumber, IsOptional, IsString, Min } from 'class-validator'
import { databaseSchema } from 'src/database/database-schema'

export type User = typeof databaseSchema.user.$inferSelect
export type Admin = typeof databaseSchema.admin.$inferSelect

export class UpdateAdminDto {
  @IsString()
  @ApiProperty()
  name: string

  @IsString()
  @ApiProperty()
  email: string
}

export class RegisterUserDto {
  @IsString()
  @ApiProperty({
    example: 'userx',
  })
  name: string
  @IsString()
  @ApiProperty({
    example: 'estio9121@gmail.com',
  })
  email: string

  @IsString()
  @ApiProperty({
    example: '1111',
  })
  phone: string

  @IsString()
  @ApiProperty({
    example: '123',
  })
  password: string
}

export class UpdateUserDto {
  @ApiProperty()
  name: string
  @IsString()
  @ApiProperty()
  email: string

  @IsString()
  @ApiProperty()
  phone: string
}

export class PaginationParamsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit: number | null = null

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  idsToSkip: number
}
