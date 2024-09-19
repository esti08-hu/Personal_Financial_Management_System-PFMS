import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { and, asc, eq, sql, count, or, isNotNull, isNull } from "drizzle-orm";
import { databaseSchema } from "src/database/database-schema";
import { DrizzleService } from "src/database/drizzle.service";
import { Role } from "src/permissions/role.emum";
import { UpdateAdminDto, UpdateUserDto } from "./users.dto";
import { randomUUID } from "crypto";

@Injectable()
export class UsersService {
  constructor(private drizzle: DrizzleService) {}

  // async updateUser(user: User){

  // }

  async updateAdminUser(pid, user) {
    await this.drizzle.db.execute(sql`
      UPDATE "Admins"
      SET "name" = ${user.fullName}, "email" = ${user.emailAddress}
      WHERE "pid" = ${pid}  
  `);
  }

  async deletedAccounts(): Promise<any> {
    const result = await this.drizzle.db
      .select()
      .from(databaseSchema.user)
      .where(isNotNull(databaseSchema.user.deletedAt));
    const sanitizedUsers = result.map((allUsers) => {
      const {
        id,
        password,
        passwordInit,
        passwordResetToken,
        refreshToken,
        ...userdata
      } = allUsers;
      return userdata;
    });
    const data = sanitizedUsers;
    return { data };
  }

  async adminFromUser(pid): Promise<any> {
    const userData = await this.getUserByPid(pid);
    if (!userData) {
      throw new NotFoundException("User not found");
    }

    await this.drizzle.db.transaction(async (tx) => {
      const userPid = randomUUID().toString();
      const [user] = await this.drizzle.db
        .insert(databaseSchema.admin)
        .values({
          pid: userPid,
          name: userData.name,
          email: userData.email,
          password: userData.password,
        })
        .returning();

      if (!user) {
        await tx.rollback();
        throw new Error("Failed to migrate user to admin");
      }

      const deletedUser = await this.drizzle.db.execute(sql`
            UPDATE "Users"
            SET "deletedAt" = ${new Date()}
            WHERE "pid" = ${userData.pid} AND "deletedAt" IS NULL
        `);

      if (!deletedUser) {
        await tx.rollback();
        throw new Error("Failed to soft delete the user");
      }
    });
    return "User migrated to admin successfully";
  }

  async updateUser(pid: string, data: UpdateUserDto) {
    const isPhoneExist = await this.getUserByPhone(data.phone)
    if(isPhoneExist){
      throw new BadRequestException("Phone already exists")
    }
    const updateUser = await this.drizzle.db
      .update(databaseSchema.user)
      .set(data)
      .where(
        and(
          eq(databaseSchema.user.pid, pid),
          isNull(databaseSchema.user.deletedAt)
        )
      )
      .returning();

    if (updateUser.length === 0) {
      throw new NotFoundException("");
    }
    return updateUser.pop();
  }

  async restoreUser(pid: string) {
    const user = await this.getUserByPid(pid);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    const isAdmin = await this.getAdminByEmail(user.email);
    if (isAdmin) throw new BadRequestException();

    if (user.deletedAt) {
      const restoreUser = await this.drizzle.db.execute(sql`
        UPDATE "Users"
        SET "deletedAt" = NULL
        WHERE "pid" = ${pid} AND "deletedAt" IS NOT NULL
        `);
      return "user restored successfully";
    }
    return "user already restored";
  }

  async deleteUser(pid: string) {
    const user = await this.getUserByPid(pid);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    if (user.deletedAt === null) {
      await this.drizzle.db.execute(sql`
        UPDATE "Users"
        SET "deletedAt" = ${new Date()}
        WHERE "pid" = ${pid} AND "deletedAt" IS NULL
        `);
      return "soft delete successfully";
    }
    return "user deleted already";
  }

  async getUserId(pid: string) {
    const user = await this.getUserByPid(pid);
    return user.id;
  }

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

  async getAdminByEmail(email: string): Promise<any> {
    return this.drizzle.db.query.admin.findFirst({
      where: eq(databaseSchema.admin.email, email),
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
      .where(isNull(databaseSchema.user.deletedAt))
      .orderBy(asc(databaseSchema.user.id));

    const sanitizedUsers = allUsers.map((allUsers) => {
      const {
        id,
        password,
        passwordInit,
        passwordResetToken,
        profilePicture,
        refreshToken,
        deletedAt,
        ...userdata
      } = allUsers;
      return userdata;
    });
    const data = sanitizedUsers;
    return { data };
  }

  async getUnverifiedAccounts(): Promise<any> {
    const unverifiedUsers = await this.drizzle.db
      .select()
      .from(databaseSchema.user)
      .where(
        and(
          eq(databaseSchema.user.isEmailConfirmed, false),
          isNull(databaseSchema.user.deletedAt)
        )
      );
    const sanitizedUsers = unverifiedUsers.map((user) => {
      const {
        id,
        password,
        passwordInit,
        passwordResetToken,
        profilePicture,
        refreshToken,
        deletedAt,
        ...userdata
      } = user;
      return userdata;
    });
    const data = sanitizedUsers;
    return { data };
  }

  async getLockedAccounts(): Promise<any> {
    const unverifiedUsers = await this.drizzle.db
      .select()
      .from(databaseSchema.user)
      .where(
        and(
          isNotNull(databaseSchema.user.accountLockedUntil),
          isNull(databaseSchema.user.deletedAt)
        )
      );
    const sanitizedUsers = unverifiedUsers.map((user) => {
      const {
        id,
        password,
        passwordInit,
        passwordResetToken,
        profilePicture,
        refreshToken,
        // deletedAt,
        ...userdata
      } = user;
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

  async getActiveAccountsCount(): Promise<any> {
    const result = await this.drizzle.db
      .select({ count: count() })
      .from(databaseSchema.user)
      .where(
        and(
          eq(databaseSchema.user.isEmailConfirmed, true),
          isNull(databaseSchema.user.accountLockedUntil),
          isNull(databaseSchema.user.deletedAt)
        )
      );

    return result[0]?.count || 0;
  }

  async getInActiveAccountsCount(): Promise<any> {
    const result = await this.drizzle.db
      .select({ count: count() })
      .from(databaseSchema.user)
      .where(
        and(
          or(
            eq(databaseSchema.user.isEmailConfirmed, false),
            isNotNull(databaseSchema.user.accountLockedUntil)
          ),
          isNull(databaseSchema.user.deletedAt)
        )
      );

    return result[0]?.count || 0;
  }

  async getUnverifiedAccountsCount(): Promise<any> {
    const result = await this.drizzle.db
      .select({ count: count() })
      .from(databaseSchema.user)
      .where(or(eq(databaseSchema.user.isEmailConfirmed, false)));

    return result[0]?.count || 0;
  }

  async getLockedUsersCount(): Promise<any> {
    const result = await this.drizzle.db
      .select({ count: count() })
      .from(databaseSchema.user)
      .where(isNotNull(databaseSchema.user.accountLockedUntil));

    return result[0]?.count || 0;
  }

  async totalAccountsCount(): Promise<any> {
    const result = await this.drizzle.db
      .select({ count: count() })
      .from(databaseSchema.user);
    return result[0]?.count || 0;
  }
}
