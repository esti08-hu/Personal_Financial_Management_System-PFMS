import { randomUUID } from "crypto";
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { sql } from "drizzle-orm";
import { Response } from "express";
import { Auth, google } from "googleapis";
import * as jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
import { AuthService } from "src/auth/services/auth.service";
import { DrizzleService } from "src/database/drizzle.service";
import { Role } from "src/permissions/role.emum";
import { User } from "src/users/users.dto";
import { UsersService } from "src/users/users.service";

@Injectable()
export class GoogleAuthenticationService {
  oauthClient: Auth.OAuth2Client;
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly drizzle: DrizzleService
  ) {
    const clientID = this.configService.get("GOOGLE_AUTH_CLIENT_ID");
    const clientSecret = this.configService.get("GOOGLE_AUTH_CLIENT_SECRET");

    this.oauthClient = new google.auth.OAuth2(clientID, clientSecret);
  }
  async getUserData(token: string) {
    const userInfoClient = google.oauth2("v2").userinfo;

    this.oauthClient.setCredentials({
      access_token: token,
    });

    const userInfoResponse = await userInfoClient.get({
      auth: this.oauthClient,
    });
    return userInfoResponse.data;
  }

  async getCookiesForUser(user: User) {
    const { cookie: accessTokenCookie, token: accessToken } =
      this.authService.getCookieWithJwtAccessToken(user);
    const { cookie: refreshTokenCookie, token: refreshToken } =
      this.authService.getCookieWithJwtRefreshToken(user);

    await this.usersService.setRefreshToken(user.pid, refreshToken, [
      Role.USER,
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async handleRegisteredUser(user: User) {
    if (!user && !user.isRegisteredWithGoogle && !user.isEmailConfirmed) {
      throw new BadRequestException("Email not registered with Google ");
    }

    const { accessToken, refreshToken } = await this.getCookiesForUser(user);
    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async googleRegister(decodedToken: any): Promise<any> {
    console.log("Registering user with google");
    await this.drizzle.db.execute(sql`
        INSERT INTO "Users" ("pid", "name", "email","profilePicture", "isRegisteredWithGoogle", "isEmailConfirmed")
        VALUES (${randomUUID()}, ${decodedToken.name}, ${decodedToken.email},${decodedToken.picture}, ${true}, ${true});
    `);
    const user = await this.usersService.findUserByEmail(decodedToken.email);
    if (!user) throw new InternalServerErrorException();

    const { accessToken, refreshToken } = await this.getCookiesForUser(user);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async authenticate(token: string, isSignup: string): Promise<any> {
    if (!token)
      throw new UnauthorizedException("Google auth token is required");

    // Decode the token
    const decodedToken = jwt.decode(token) as JwtPayload;

    if (!decodedToken || typeof decodedToken === "string") {
      throw new UnauthorizedException("Invalid token");
    }

    // Validate the 'aud' and 'iss' properties
    if (decodedToken.aud !== process.env.GOOGLE_AUTH_CLIENT_ID) {
      throw new UnauthorizedException("Invalid audience");
    }

    if (decodedToken.iss !== "https://accounts.google.com") {
      throw new UnauthorizedException("Invalid issuer");
    }

    const email = decodedToken.email;

    const user = await this.usersService.findUserByEmail(email);

    if (user.accountLockedUntil && new Date() < user.accountLockedUntil) {
      const now = new Date()
      const timeDifference = user.accountLockedUntil.getTime() - now.getTime() // Difference in milliseconds

      const minutes = Math.floor(timeDifference / 1000 / 60)

      throw new UnauthorizedException(
        `Account is locked. Try again after ${minutes} minutes.`,
      )
    } if (user.accountLockedUntil && new Date() < user.accountLockedUntil) {
      const now = new Date()
      const timeDifference = user.accountLockedUntil.getTime() - now.getTime() // Difference in milliseconds

      const minutes = Math.floor(timeDifference / 1000 / 60)

      throw new UnauthorizedException(
        `Account is locked. Try again after ${minutes} minutes.`,
      )
    }
    
    if (user && isSignup === "signin") return this.handleRegisteredUser(user);
    if (!user && isSignup === "signup")
      return this.googleRegister(decodedToken);
    if (user) throw new BadRequestException("Email is already registered");
    throw new BadRequestException("Invalid signup type");
  }
}
