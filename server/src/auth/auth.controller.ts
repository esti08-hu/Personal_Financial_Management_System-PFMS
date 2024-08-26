import {
  BadGatewayException,
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Request,
  Response,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { EmailConfirmationGuard } from "src/emailConfirmation/emailConfirmation.guard";
import { EmailConfirmationService } from "src/emailConfirmation/emailConfirmation.service";
import { Permissions, Roles } from "src/permissions/permissions.decorators";
import { Permission, Role } from "src/permissions/role.emum";
import { RegisterUserDto } from "src/users/users.dto";
import { AuthDto } from "./auth.dto";
import { AccessTokenPayload } from "./auth.interfaces";
import { Public, User } from "./guards/auth.decorators";
import { JwtRefreshTokenGuard } from "./guards/refresh-token.guard";
import { AuthService } from "./services/auth.service";
import { UsersService } from "src/users/users.service";

@Controller("auth")
@ApiBearerAuth()
@ApiTags("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private emailConfirmationService: EmailConfirmationService,
    private usersService: UsersService
  ) {}

  @Post("login")
  @Public()
  async singIn(
    @Body() signInDto: AuthDto,
    @Response({ passthrough: true }) res,
    @Request() req
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
      maxAge: 1000 * 60 * 60 * 7, // 7 days
      httpOnly: true,
    });
    res.cookie("access_token", accessToken, {
      maxAge: 1000 * 60 * 3, // 3 minuts
      httpOnly: true,
    });

    return { accessToken, refreshToken };
  }

  @Post("register")
  @Public()
  async register(@Body() registerBody: RegisterUserDto): Promise<any> {
    const user = await this.authService.register(registerBody);

    await this.emailConfirmationService.sendVerificationLink(
      registerBody.email
    );

    return {
      message:
        "Verification link sent to your email. If you could not find it check in you spam foler.",
    };
  }

  @Get("refresh")
  @Public()
  // @UseGuards(JwtRefreshTokenGuard)
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
        maxAge: 1000 * 60 * 3, // 3 minuts
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

  @Get("admin-profile")
  @Roles(Role.ADMIN)
  getAdminProfile(@Request() req) {
    return req.user;
  }

  @Get("user-profile")
  @Roles(Role.USER)
  async getUserProfile(@Request() req) {
    const user = await this.usersService.getUserByPid(req.user.pid)
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
