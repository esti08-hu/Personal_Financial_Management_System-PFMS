import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { databaseSchema } from 'src/database/database-schema';
import { DrizzleService } from 'src/database/drizzle.service';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/permissions/role.emum';

@Injectable()
export class UsersService {
  constructor(private drizzle: DrizzleService) {}

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

  // async markEmailAsConfirmed(email: string) {
  //   await this.drizzle.db.transaction(async (trx) => {
  //     await trx
  //       .update(databaseSchema.user)
  //       .set({ isEmailConfirmed: true })
  //       .where(eq(databaseSchema.user.email, email))
  //       .execute();
  //   });
  // }

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
    roles: Role[],
  ) {
    // Hash the token to prevent user impersonation in a possible database leak
    if (refreshToken) refreshToken = await bcrypt.hash(refreshToken, 8);
    if (roles.includes(Role.ADMIN)) {
      await this.drizzle.db
        .update(databaseSchema.admin)
        .set({ refreshToken })
        .where(eq(databaseSchema.admin.pid, pid));

      const admin = await this.drizzle.db.query.admin.findFirst({
        where: eq(databaseSchema.admin.pid, pid),
      });

      if (!admin) throw new NotFoundException('Admin not found');
      return admin;
    } else if (roles.includes(Role.USER)) {
      await this.drizzle.db
        .update(databaseSchema.user)
        .set({ refreshToken })
        .where(eq(databaseSchema.user.pid, pid));

      const user = await this.drizzle.db.query.user.findFirst({
        where: eq(databaseSchema.user.pid, pid),
      });

      if (!user) throw new NotFoundException('User not found');
      return user;
    }
    // Add more roles here in the future
  }
}
