import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import { databaseSchema } from 'src/database/database-schema';
import { DrizzleService } from 'src/database/drizzle.service';
import { AccessTokenPayload } from '../auth.interfaces';
import { Role } from 'src/permissions/role.emum';
import { PasswordService } from './password.service';
import { UsersService } from 'src/users/users.service';
import { RegisterUserDto } from 'src/users/users.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private drizzle: DrizzleService,
    private jwtService: JwtService,
    private usersService: UsersService,
    private passwordService: PasswordService,
  ) {}

  async register(user: RegisterUserDto): Promise<any> {
    const existingEmail = await this.usersService.getUserByEmail(user.email, [
      Role.USER,
    ]);
    if (existingEmail) {
      throw new BadRequestException('email already exists');
    }
    const existingPhone = await this.usersService.getUserByPhone(user.phone);
    if (existingPhone) {
      throw new BadRequestException('phone number already exists');
    }
    const hashedPassword = await this.passwordService.hashPassword(
      user.password,
    );
    await this.drizzle.db.insert(databaseSchema.user).values({
      pid: randomUUID(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: hashedPassword,
      passwordInit: user.password,
      refreshToken: null, // Initial value for refreshToken
    });
    return this.signIn(user.email, user.password);
  }

  async signIn(email: string, pass: string): Promise<any> {
    const user = await this.usersService.getUserByEmail(email, [Role.USER]);
    if (!user) throw new NotFoundException('User not found');

    const isTheRightPassword = await this.passwordService.isTheRightPassword(
      pass,
      user.password,
    );

    if (!isTheRightPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: AccessTokenPayload = {
      pid: user.pid,
      name: user.name,
      roles: [Role.USER],
    };

    const refreshToken = await this.jwtService.sign(payload);

    await this.usersService.setRefreshToken(
      user.pid,
      refreshToken,
      payload.roles,
    );
    const accessToken = await this.jwtService.sign(payload);

    return {
      accessToken,
      refreshToken,
    };
  }

  async signInAdmin(email: string, pass: string): Promise<any> {
    const admin = await this.usersService.getUserByEmail(email, [Role.ADMIN]);

    if (!admin) throw new NotFoundException('Admin not found');

    const isTheRightPassword = await this.passwordService.isTheRightPassword(
      pass,
      admin.password,
    );

    if (!isTheRightPassword)
      throw new UnauthorizedException('Invalid credentials');

    const payload: AccessTokenPayload = {
      pid: admin.pid,
      name: admin.name,
      roles: [Role.ADMIN],
    };

    const refreshToken = await this.jwtService.sign(payload);

    await this.usersService.setRefreshToken(
      admin.pid,
      refreshToken,
      payload.roles,
    );
    const accessToken = await this.jwtService.sign(payload);

    return {
      accessToken,
      refreshToken,
    };
  }

  async logout(pid: string, roles: Role[]) {
    const user = await this.usersService.setRefreshToken(pid, null, roles);
    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async updateAccessToken(refreshToken: string) {
    const data = this.jwtService.decode(refreshToken) as {
      pid: string;
      name: string;
      roles: Role[];
    };

    if (!data || !data.pid)
      throw new UnauthorizedException('Refresh token not found');

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
      throw new UnauthorizedException('Role not recognized');
    }
    if (!userOrAdmin) throw new NotFoundException('User or admin not found');
    if (!userOrAdmin.refreshToken) {
      throw new BadRequestException('Refresh token not provided');
    }
    const isValidRefreshToken = await this.passwordService.validateHash(
      refreshToken,
      userOrAdmin.refreshToken,
    );
    if (!isValidRefreshToken)
      throw new UnauthorizedException('Invalid refresh token');

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
      throw new UnauthorizedException('Role not recognized');
    }

    if (!userOrAdmin) throw new NotFoundException('No user found');
    if (
      !(await this.passwordService.validateHash(
        refreshToken,
        userOrAdmin.refreshToken,
      ))
    )
      throw new UnauthorizedException('refresh token not valid');
    return true; // Previuosly, this method returned the user or admin
  }
}
