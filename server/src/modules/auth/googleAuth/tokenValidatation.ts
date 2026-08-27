import { IsNotEmpty, IsString } from 'class-validator'

export class TokenVerificationDto {
  @IsString()
  @IsNotEmpty()
  token: string
}

export default TokenVerificationDto
