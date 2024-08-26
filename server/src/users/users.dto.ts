import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'
import { databaseSchema } from 'src/database/database-schema'

export type User = typeof databaseSchema.user.$inferSelect
export type Admin = typeof databaseSchema.admin.$inferSelect

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

  // @IsString()
  // @ApiProperty({
  //   example: '123',
  // })
  // passwordInit: string
}
