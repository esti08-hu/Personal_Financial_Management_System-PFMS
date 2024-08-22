import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  Request,
  Response,
  UseInterceptors,
} from '@nestjs/common'
import { ApiBasicAuth, ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { Public } from 'src/auth/guards/auth.decorators'
import { AuthService } from 'src/auth/services/auth.service'
import { GoogleAuthenticationService } from './googleAuth.service'
import TokenVerificationDto from './tokenValidatation'
// import { Request } from "express";

@Controller('google')
@ApiBearerAuth()
@ApiTags('googleAuth')
@UseInterceptors(ClassSerializerInterceptor)
export class GoogleAuthenticationController {
  constructor(
    private readonly googleAuthenticationService: GoogleAuthenticationService,
    private readonly authService: AuthService,
  ) {}

  @Post('signin')
  @Public()
  async authenticate(
    @Body() tokenData: TokenVerificationDto,
    @Response({ passthrough: true }) res,
    @Request() req,
  ) {
    const isSignup = req.body.endpoint
    const { accessToken, refreshToken, user } =
      await this.googleAuthenticationService.authenticate(
        tokenData.token,
        isSignup,
      )

    res.cookie('refresh_token', refreshToken, {
      maxAge: 1000 * 60 * 60 * 7, // 7 days
      httpOnly: true,
      path: '/',
    })
    res.cookie('access_token', accessToken, {
      maxAge: 1000 * 60 * 3, // 3 minuts
      httpOnly: true,
      path: '/',
    })

    console.log('login with google ')

    return { accessToken, refreshToken }
  }

  @Post('signup')
  @Public()
  async signup(
    @Body() tokenData: TokenVerificationDto,
    @Response({ passthrough: true }) res,
    @Request() req,
  ) {
    const isSignup = req.body.endpoint
    const { accessToken, refreshToken, user } =
      await this.googleAuthenticationService.authenticate(
        tokenData.token,
        isSignup,
      )

    res.cookie('refresh_token', refreshToken, {
      maxAge: 1000 * 60 * 60 * 7, // 7 days
      httpOnly: true,
      path: '/',
    })
    res.cookie('access_token', accessToken, {
      maxAge: 1000 * 60 * 3, // 3 minuts
      httpOnly: true,
      path: '/',
    })

    console.log('Signup with google ')

    return { accessToken, refreshToken }
  }
}
