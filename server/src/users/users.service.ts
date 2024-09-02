import { Injectable, NotFoundException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { eq, sql } from 'drizzle-orm'
import { databaseSchema } from 'src/database/database-schema'
import { DrizzleService } from 'src/database/drizzle.service'
import { Role } from 'src/permissions/role.emum'

@Injectable()
export class UsersService {
  constructor(private drizzle: DrizzleService) {}

  public async updatePasswordResetToken(pid: string, token: string) {
    await this.drizzle.db.execute(sql`
      UPDATE "Users"
      SET "passwordResetToken" = ${token}, "passwordResetTokenExpires"=${new Date(Date.now() + 3600 * 1000)}
      WHERE "pid" = ${pid};
    `)
  }

  async findUserByEmail(email: string): Promise<any> {
    return this.drizzle.db.query.user.findFirst({
      where: eq(databaseSchema.user.email, email),
    })
  }
  async getUserByEmail(email: string, roles: Role[]): Promise<any> {
    if (roles.includes(Role.ADMIN)) {
      return this.drizzle.db.query.admin.findFirst({
        where: eq(databaseSchema.admin.email, email),
      })
    } else if (roles.includes(Role.USER)) {
      return this.drizzle.db.query.user.findFirst({
        where: eq(databaseSchema.user.email, email),
      })
    }
  }
  async getUserByPhone(phone: string): Promise<any> {
    return this.drizzle.db.query.user.findFirst({
      where: eq(databaseSchema.user.phone, phone),
    })
  }

  async getUserByPid(pid: string): Promise<any> {
    return this.drizzle.db.query.user.findFirst({
      where: eq(databaseSchema.user.pid, pid),
    })
  }

  async markEmailAsConfirmed(email: string) {
    return await this.drizzle.db.execute(sql`
      UPDATE "Users"
      SET "isEmailConfirmed" = true
      WHERE "email" = ${email};
    `)
  }

  async setRefreshToken(
    pid: string,
    refreshToken: string | null,
    roles: Role[],
  ) {
    let hashedRefreshToken: string | null = null
    if (refreshToken) {
      hashedRefreshToken = await bcrypt.hash(refreshToken, 8)
    }

    if (roles.includes(Role.ADMIN)) {
      await this.drizzle.db.execute(sql`
        UPDATE "Admins"
        SET "refreshToken" = ${hashedRefreshToken}
        WHERE "pid" = ${pid};
      `)

      const admin = await this.drizzle.db.query.admin.findFirst({
        where: eq(databaseSchema.admin.pid, pid),
      })

      if (!admin) throw new NotFoundException('Admin not found')
      return admin
    }

    const query = sql`
    UPDATE "Users"
    SET "refreshToken" = ${hashedRefreshToken}
    WHERE "pid" = ${pid};
  `

    await this.drizzle.db.execute(query)

    const user = await this.drizzle.db.query.user.findFirst({
      where: eq(databaseSchema.user.pid, pid),
    })

    if (!user) throw new NotFoundException('User not found')
    return user
  }
  // Add more roles here in the future
}
