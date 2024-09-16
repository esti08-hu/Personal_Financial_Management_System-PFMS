import {
  BadGatewayException,
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Request,
  Response,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { EmailConfirmationService } from "src/emailConfirmation/emailConfirmation.service";
import { Permissions, Roles } from "src/permissions/permissions.decorators";
import { Permission, Role } from "src/permissions/role.emum";
import { RegisterUserDto } from "src/users/users.dto";
import { UsersService } from "src/users/users.service";
import { AuthDto } from "../auth.dto";
import { AccessTokenPayload } from "../auth.interfaces";
import { Public, User } from "../guards/auth.decorators";
import { JwtRefreshTokenGuard } from "../guards/refresh-token.guard";
import { AuthService } from "../services/auth.service";
import { PasswordService } from "../services/password.service";

@Controller("auth")
@ApiBearerAuth()
@ApiTags("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private emailConfirmationService: EmailConfirmationService,
    private usersService: UsersService,
    private passwordService: PasswordService
  ) {}

  @Post("login")
  @Public()
  async singIn(
    @Body() signInDto: AuthDto,
    @Response({ passthrough: true }) res,
    @Request() req,
    @Body("rememberMe") rememberMe: boolean
  ): Promise<any> {
    let accessToken: string;
    let refreshToken: string;

    if (signInDto.isAdmin) {
      ({ accessToken, refreshToken } = await this.authService.signInAdmin(
        signInDto.email,
        signInDto.password
      ));
    } else {
      ({ accessToken, refreshToken } = await this.authService.signIn(
        signInDto.email,
        signInDto.password
      ));
    }
    res.cookie("refresh_token", refreshToken, {
      maxAge: 1000 * 60 * 60 * 15, // 15 days
      httpOnly: true,
    });
    res.cookie("access_token", accessToken, {
      maxAge: rememberMe ? 1000 * 60 * 60 * 24 * 7 : 1000 * 15, // 3 minuts or 7 days
      httpOnly: true,
    });
    return { accessToken, refreshToken };
  }

  @Post("register")
  @Public()
  async register(@Body() registerBody: RegisterUserDto): Promise<any> {
    const { success } =
      await this.emailConfirmationService.sendVerificationLink(
        registerBody.email
      );

    if (success) await this.authService.register(registerBody);

    return {
      message:
        "Verification link sent to your email. If you could not find it check in you spam folder.",
    };
  }

  @Get("refresh")
  @Public()
  async refreshAccessToken(
    @Request() req,
    @Response({ passthrough: true }) res
  ) {
    const cookies = req.cookies ?? req.signedCookies;
    const refreshToken = cookies.refresh_token;
    if (!cookies.access_token) {
      const accessToken =
        await this.authService.updateAccessToken(refreshToken);

      res.cookie("access_token", accessToken, {
        maxAge: 1000 * 60 * 3, // 3 minutes
        httpOnly: true,
        path: "/",
      });
      return { message: "Access token refreshed" };
    }
    return { message: "Access token is still valid" };
  }

  @Post("logout")
  @UseGuards(JwtRefreshTokenGuard)
  @HttpCode(200)
  async logout(
    @User() user: AccessTokenPayload,
    @Response({ passthrough: true }) res
  ) {
    if (!user) {
      return { message: "User not found" };
    }

    await this.authService.logout(user.pid, user.roles);
    // Clear cookies
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    return { message: "Logout successful" };
  }

  @Public()
  @Post("forgot-password")
  async forgotPasseord(@Body("email") email: string) {
    await this.authService.sendResetLink(email);
    return { message: "Password reset link sent successfully!" };
  }

  @Public()
  @Post("reset-password")
  async resetPassword(
    @Query("token") token: string,
    @Body("newPassword") newPassword: string
  ): Promise<any> {
    if (newPassword && token) {
      await this.passwordService.resetPassword(token, newPassword);
      return { message: "Password has been reset successfully." }; // Provide a success response
    }
    throw new BadRequestException("Invalid token or password");
  }

  @Get("admin-profile")
  @Roles(Role.ADMIN)
  async getAdminProfile(@Request() req) {
    const admin = await this.usersService.getAdminByPid(req.user.pid);
    return admin;
  }

  @Get("user-profile")
  @Roles(Role.USER)
  async getUserProfile(@Request() req) {
    const user = await this.usersService.getUserByPid(req.user.pid);
    return user;
  }

  @Get("create-user")
  @Permissions(Permission.CREATE_USER)
  createUser() {
    return "Create User page!";
  }

  @Get("check-cookies")
  @Public()
  async checkCookies(@Req() req) {
    return req.cookies;
  }
}
