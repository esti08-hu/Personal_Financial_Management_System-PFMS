import { randomUUID } from "crypto";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Request,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { eq, sql } from "drizzle-orm";
import { Response } from "express";
import { databaseSchema } from "src/database/database-schema";
import { DrizzleService } from "src/database/drizzle.service";
import { Role } from "src/permissions/role.emum";
import { RegisterUserDto } from "src/users/users.dto";
import { UsersService } from "src/users/users.service";
import { AccessTokenPayload, RefreshTokenPayload } from "../auth.interfaces";
import { PasswordService } from "./password.service";

@Injectable()
export class AuthService {
  constructor(
    private drizzle: DrizzleService,
    private jwtService: JwtService,
    private usersService: UsersService,
    private passwordService: PasswordService
  ) {}

  public getCookieWithJwtRefreshToken(user) {
    const payload: RefreshTokenPayload = {
      pid: user.pid,
      roles: [Role.USER],
    };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
    });

    const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME}`;

    return {
      cookie,
      token,
    };
  }

  // public getJwtAccessToken(user) {
  //   const payload: AccessTokenPayload = {
  //     pid: user.pid,
  //     name: user.name,
  //     roles: [Role.USER],
  //   };

  //   const token = this.jwtService.sign(payload, {
  //     secret: process.env.JWT_ACCESS_TOKEN_SECRET,
  //     expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
  //   });

  //   return token;
  // }

  public getCookieWithJwtAccessToken(user) {
    const payload: AccessTokenPayload = {
      pid: user.pid,
      name: user.name,
      roles: [Role.USER],
    };

    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
    });

    const cookie = `Authentication=${token}; HttpOnly; Path=/; Max-Age=${process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME}`;

    return {
      token,
      cookie,
    };
  }

  async register(user: RegisterUserDto): Promise<any> {
    const existingEmail = await this.usersService.getUserByEmail(user.email, [
      Role.USER,
    ]);
    if (existingEmail) {
      throw new BadRequestException("Email is already registered");
    }
    const existingPhone = await this.usersService.getUserByPhone(user.phone);
    if (existingPhone) {
      throw new BadRequestException("phone number already exists");
    }

    const hashedPassword = await this.passwordService.hashPassword(
      user.password
    );

    await this.drizzle.db.execute(sql`
      INSERT INTO "Users" ("pid", "name", "email", "phone", "password", "passwordInit", "refreshToken")
      VALUES (${randomUUID()}, ${user.name}, ${user.email}, ${user.phone}, ${hashedPassword}, ${user.password}, NULL);
    `);
  }

  async signIn(email: string, pass: string): Promise<any> {
    const user = await this.usersService.getUserByEmail(email, [Role.USER]);

    if (!user) throw new NotFoundException("User not found");
    if (!user.isEmailConfirmed) throw new UnauthorizedException("Please confirm your email to Login");
    if (!user.password) throw new UnauthorizedException("It looks like you signed up using Google. Please sign in with Google instead.");
    const isTheRightPassword = await this.passwordService.isTheRightPassword(
      pass,
      user.password
    );

    if (!isTheRightPassword) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const accessTokenPayload: AccessTokenPayload = {
      pid: user.pid,
      name: user.name,
      roles: [Role.USER],
    };

    const refreshTokenPayload: RefreshTokenPayload = {
      pid: user.pid,
      roles: [Role.USER],
    };

    const refreshToken = await this.jwtService.signAsync(refreshTokenPayload);

    await this.usersService.setRefreshToken(user.pid, refreshToken, [
      Role.USER,
    ]);
    const accessToken = await this.jwtService.sign(accessTokenPayload);

    return {
      accessToken,
      refreshToken,
    };
  }

  async signInAdmin(email: string, pass: string): Promise<any> {
    const admin = await this.usersService.getUserByEmail(email, [Role.ADMIN]);

    if (!admin) throw new NotFoundException("Admin not found");

    const isTheRightPassword = await this.passwordService.isTheRightPassword(
      pass,
      admin.password
    );

    if (!isTheRightPassword)
      throw new UnauthorizedException("Invalid credentials");

    const accessTokenPayload: AccessTokenPayload = {
      pid: admin.pid,
      name: admin.name,
      roles: [Role.ADMIN],
    };

    const refreshTokenPayload: RefreshTokenPayload = {
      pid: admin.pid,
      roles: [Role.ADMIN],
    };

    const refreshToken = await this.jwtService.signAsync(refreshTokenPayload);

    await this.usersService.setRefreshToken(admin.pid, refreshToken, [
      Role.ADMIN,
    ]);
    const accessToken = await this.jwtService.sign(accessTokenPayload);

    return {
      accessToken,
      refreshToken,
    };
  }

  async logout(pid: string, roles: Role[]) {
    const user = await this.usersService.setRefreshToken(pid, null, roles);
    if (!user) throw new NotFoundException("User not found");

    return user;
  }

  async updateAccessToken(refreshToken: string) {
    const data = this.jwtService.decode(refreshToken) as RefreshTokenPayload;

    if (!data || !data.pid)
      throw new UnauthorizedException("Refresh token not found");

    let userOrAdmin;
    let role: Role[];
    if (data.roles.includes(Role.ADMIN)) {
      userOrAdmin = await this.drizzle.db.query.admin.findFirst({
        where: eq(databaseSchema.admin.pid, data.pid),
      });
      role = [Role.ADMIN];
    } else if (data.roles.includes(Role.USER)) {
      userOrAdmin = await this.drizzle.db.query.user.findFirst({
        where: eq(databaseSchema.user.pid, data.pid),
      });
      role = [Role.USER];
    } else {
      throw new UnauthorizedException("Role not recognized");
    }
    if (!userOrAdmin) throw new NotFoundException("User or admin not found");
    if (!userOrAdmin.refreshToken) {
      throw new BadRequestException("Refresh token not provided");
    }
    const isValidRefreshToken = await this.passwordService.validateHash(
      refreshToken,
      userOrAdmin.refreshToken
    );
    if (!isValidRefreshToken)
      throw new UnauthorizedException("Invalid refresh token");

    const payload: AccessTokenPayload = {
      pid: userOrAdmin.pid,
      name: userOrAdmin.name,
      roles: role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    // Return the token directly or as part of an object based on your needs
    return accessToken;
  }

  async validateRefreshToken(pid: string, refreshToken: string, roles: Role[]) {
    let userOrAdmin;

    if (roles.includes(Role.ADMIN)) {
      userOrAdmin = await this.drizzle.db.query.admin.findFirst({
        where: eq(databaseSchema.admin.pid, pid),
      });
    } else if (roles.includes(Role.USER)) {
      userOrAdmin = await this.drizzle.db.query.user.findFirst({
        where: eq(databaseSchema.user.pid, pid),
      });
    } else {
      throw new UnauthorizedException("Role not recognized");
    }

    if (!userOrAdmin) throw new NotFoundException("No user found");
    if (
      !(await this.passwordService.validateHash(
        refreshToken,
        userOrAdmin.refreshToken
      ))
    )
      throw new UnauthorizedException("refresh token not valid");
    return true; // Previuosly, this method returned the user or admin
  }
}
