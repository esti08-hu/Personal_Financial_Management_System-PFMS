import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsString } from 'class-validator'

export class AuthDto {
  @ApiProperty({
    example: 'estio9121@gmail.com',
  })
  @IsString()
  email: string

  @ApiProperty({
    example: '123',
  })
  @IsString()
  password: string

  @ApiProperty({ required: false })
  @IsBoolean()
  isAdmin: boolean
}

export class EmailVerificationDto {
  @IsString()
  pid: number

  @ApiProperty({ uniqueItems: true })
  @IsString()
  email: string

  @ApiProperty({ required: false })
  @IsBoolean()
  isEmailConfirmed: boolean
}
