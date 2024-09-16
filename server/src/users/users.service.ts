import { Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { isNotEmpty } from "class-validator";
import { and, asc, desc, eq, sql, count, or, isNotNull, isNull } from "drizzle-orm";
import { databaseSchema } from "src/database/database-schema";
import { DrizzleService } from "src/database/drizzle.service";
import { Role } from "src/permissions/role.emum";

@Injectable()
export class UsersService {
  constructor(private drizzle: DrizzleService) {}

  public async updatePasswordResetToken(pid: string, token: string) {
    await this.drizzle.db.execute(sql`
      UPDATE "Users"
      SET "passwordResetToken" = ${token}, "passwordResetTokenExpires"=${new Date(Date.now() + 3600 * 1000)}
      WHERE "pid" = ${pid};
    `);
  }

  async findUserByEmail(email: string): Promise<any> {
    return this.drizzle.db.query.user.findFirst({
      where: eq(databaseSchema.user.email, email),
    });
  }
  async getUserByEmail(email: string, roles: Role[]): Promise<any> {
    if (roles.includes(Role.ADMIN)) {
      return this.drizzle.db.query.admin.findFirst({
        where: eq(databaseSchema.admin.email, email),
      });
    } else if (roles.includes(Role.USER)) {
      return this.drizzle.db.query.user.findFirst({
        where: eq(databaseSchema.user.email, email),
      });
    }
  }
  async getUserByPhone(phone: string): Promise<any> {
    return this.drizzle.db.query.user.findFirst({
      where: eq(databaseSchema.user.phone, phone),
    });
  }

  async getUserByPid(pid: string): Promise<any> {
    return this.drizzle.db.query.user.findFirst({
      where: eq(databaseSchema.user.pid, pid),
    });
  }

  async getAdminByPid(pid: string): Promise<any> {
    return this.drizzle.db.query.admin.findFirst({
      where: eq(databaseSchema.admin.pid, pid),
    });
  }

  async markEmailAsConfirmed(email: string) {
    return await this.drizzle.db.execute(sql`
      UPDATE "Users"
      SET "isEmailConfirmed" = true
      WHERE "email" = ${email};
    `);
  }

  async setRefreshToken(
    pid: string,
    refreshToken: string | null,
    roles: Role[]
  ) {
    let hashedRefreshToken: string | null = null;
    if (refreshToken) {
      hashedRefreshToken = await bcrypt.hash(refreshToken, 8);
    }

    if (roles.includes(Role.ADMIN)) {
      await this.drizzle.db.execute(sql`
        UPDATE "Admins"
        SET "refreshToken" = ${hashedRefreshToken}
        WHERE "pid" = ${pid};
      `);

      const admin = await this.drizzle.db.query.admin.findFirst({
        where: eq(databaseSchema.admin.pid, pid),
      });

      if (!admin) throw new NotFoundException("Admin not found");
      return admin;
    }

    const query = sql`
    UPDATE "Users"
    SET "refreshToken" = ${hashedRefreshToken}
    WHERE "pid" = ${pid};
  `;

    await this.drizzle.db.execute(query);

    const user = await this.drizzle.db.query.user.findFirst({
      where: eq(databaseSchema.user.pid, pid),
    });

    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async getAllUsers(): Promise<any> {
    const allUsers = await this.drizzle.db
      .select()
      .from(databaseSchema.user)
      .orderBy(asc(databaseSchema.user.id));
    // const allUsers = await this.drizzle.db.query.user.findMany();
    const sanitizedUsers = allUsers.map((allUsers) => {
      const {
        id,
        password,
        passwordInit,
        passwordResetToken,
        profilePicture,
        refreshToken,
        ...userdata
      } = allUsers;
      return userdata;
    });
    const data = sanitizedUsers;
    return { data };
  }

  async getNewUsers(): Promise<any> {
    const newUsers = await this.drizzle.db
      .select()
      .from(databaseSchema.user)
      .orderBy(asc(databaseSchema.user.createdAt))
      .limit(5);
    const sanitizedUsers = newUsers.map((user) => {
      const {
        id,
        password,
        passwordInit,
        passwordResetToken,
        profilePicture,
        refreshToken,
        ...userdata
      } = user;
      return userdata;
    });
    const data = sanitizedUsers;
    return { data };
  }

  async getActiveAccounts(): Promise<any> {
    const result = await this.drizzle.db
      .select({ count: count() })
      .from(databaseSchema.user)
      .where(
        and(
          eq(databaseSchema.user.isEmailConfirmed, true),
          isNull(databaseSchema.user.accountLockedUntil)
        )
      );

    return result[0]?.count || 0;
  }

  async getInActiveAccounts(): Promise<any> {
    const result = await this.drizzle.db
      .select({ count: count() })
      .from(databaseSchema.user)
      .where(
        or(
          eq(databaseSchema.user.isEmailConfirmed, false),
          isNotNull(databaseSchema.user.accountLockedUntil)
        )
      );

    return result[0]?.count || 0;
  }

  async getUnverifiedAccounts(): Promise<any> {
    const result = await this.drizzle.db
      .select({ count: count() })
      .from(databaseSchema.user)
      .where(or(eq(databaseSchema.user.isEmailConfirmed, false)));

    return result[0]?.count || 0;
  }

  async getLockedUsers(): Promise<any> {
    const result = await this.drizzle.db
      .select({ count: count() })
      .from(databaseSchema.user)
      .where(isNotNull(databaseSchema.user.accountLockedUntil));

    return result[0]?.count || 0;
  }

  async totalAccounts(): Promise<any> {
    const result = await this.drizzle.db
      .select({ count: count() })
      .from(databaseSchema.user)
    return result[0]?.count || 0;
  }
}
