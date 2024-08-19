import {
  BadGatewayException,
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { AuthDto } from './auth.dto';
import { AuthService } from './services/auth.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Permissions, Roles } from 'src/permissions/permissions.decorators';
import { Permission, Role } from 'src/permissions/role.emum';
import { Public, User } from './guards/auth.decorators';
import { JwtRefreshTokenGuard } from './guards/refresh-token.guard';
import { AccessTokenPayload } from './auth.interfaces';
import { RegisterUserDto } from 'src/users/users.dto';
import { EmailConfirmationService } from 'src/emailConfirmation/emailConfirmation.service';

@Controller('auth')
@ApiBearerAuth()
@ApiTags('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private emailConfirmationService: EmailConfirmationService,
  ) {}

  @Post('login')
  @Public()
  async singIn(
    @Body() signInDto: AuthDto,
    @Response({ passthrough: true }) res,
  ): Promise<any> {
    let accessToken: string;
    let refreshToken: string;

    if (signInDto.isAdmin) {
      ({ accessToken, refreshToken } = await this.authService.signInAdmin(
        signInDto.email,
        signInDto.password,
      ));
    } else {
      ({ accessToken, refreshToken } = await this.authService.signIn(
        signInDto.email,
        signInDto.password,
      ));
    }

    res.cookie('refresh_token', refreshToken, {
      maxAge: 1000 * 60 * 60 * 7, // 7 days
      httpOnly: true,
    });
    res.cookie('access_token', accessToken, {
      maxAge: 1000 * 60 * 2, // 30 seconds
      httpOnly: true,
    });

    return { accessToken, refreshToken };
  }

  @Post('register')
  @Public()
  async register(@Body() registerBody: RegisterUserDto): Promise<any> {
    const user = await this.authService.register(registerBody);
    if (user)
      await this.emailConfirmationService.sendVerificationLink(
        registerBody.email,
      );
    else throw new BadRequestException('User not created');
    return user;
  }

  @Get('refresh')
  @Public()
  // @UseGuards(JwtRefreshTokenGuard)
  async refreshAccessToken(
    @Request() req,
    @Response({ passthrough: true }) res,
  ) {
    const cookies = req.cookies ?? req.signedCookies;
    const refreshToken = cookies.refresh_token;
    if (!cookies.access_token) {
      const accessToken =
        await this.authService.updateAccessToken(refreshToken);
      console.log('asdf');

      res.cookie('access_token', accessToken, {
        maxAge: 1000 * 30, // 30 seconds
        httpOnly: true,
        path: '/',
      });
      return { message: 'Access token refreshed' };
    }
    return { message: 'Access token is still valid' };
  }

  @Post('logout')
  @UseGuards(JwtRefreshTokenGuard)
  @HttpCode(200)
  async logout(
    @User() user: AccessTokenPayload,
    @Response({ passthrough: true }) res,
  ) {
    if (!user) {
      return { message: 'User not found' };
    }
    await this.authService.logout(user.pid, user.roles);
    // Clear cookies
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return { message: 'Logout successful' };
  }

  @Get('admin-profile')
  @Roles(Role.ADMIN)
  getAdminProfile(@Request() req) {
    return req.user;
  }

  @Get('user-profile')
  @Roles(Role.USER)
  getUserProfile(@Request() req) {
    return req.user;
  }

  @Get('create-user')
  @Permissions(Permission.CREATE_USER)
  createUser() {
    return 'Create User page!';
  }
}
