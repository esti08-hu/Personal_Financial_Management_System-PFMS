import * as crypto from 'crypto'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { eq, sql } from 'drizzle-orm'
import * as schema from 'src/database/database-schema'
import { UsersService } from 'src/users/users.service'
import { DrizzleService } from '../../database/drizzle.service'

@Injectable()
export class PasswordService {
  constructor(
    private drizzle: DrizzleService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  private saltRounds = 12

  private async getSalt() {
    return await bcrypt.genSalt(this.saltRounds)
  }

  async hashPassword(password: string) {
    const salt = await this.getSalt()
    return await bcrypt.hash(password, salt)
  }

  async isTheRightPassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash)
  }

  async validateHash(content: string, hash: string) {
    return await bcrypt.compare(content, hash)
  }

  async updatePasswordByUser(
    pid: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.drizzle.db.query.user.findFirst({
      where: eq(schema.user.pid, pid),
    })
    if (!user) {
      throw new NotFoundException('user not found')
    }
    const isTheRightPassword = await this.isTheRightPassword(
      currentPassword,
      user.password,
    )

    if (!isTheRightPassword) {
      throw new UnauthorizedException('Current password is not the right.')
    }

    const newHashedPassword = await this.hashPassword(newPassword)

    await this.drizzle.db.execute(sql`
      UPDATE "Users"
      SET "password" = ${newHashedPassword}, "passwordInit" = ${newPassword}
      WHERE "pid" = ${pid};
    `)

    return { message: 'Password updated successfully' }
  }

  async updatePasswordByAdmin(pid: string) {
    const user = await this.drizzle.db.query.user.findFirst({
      where: eq(schema.user.pid, pid),
    })
    if (!user) {
      throw new NotFoundException('user not found')
    }
    const newPassword = await crypto.randomBytes(6).toString('hex')
    const newHashedPassword = await this.hashPassword(newPassword)
    await this.drizzle.db.execute(sql`
      UPDATE "Users
      SET "password" = ${newHashedPassword}, "passwordInit" = ${newPassword}
      WHERE "pid" = ${pid}
      returning;
      `)

    return { message: 'Password updated successfully' }
  }

  public async resetPassword(token: string, newPassword: string): Promise<any> {
    const payload = this.jwtService.verify(token, {
      secret: this.configService.get('PASSWORD_RESET_SECRET'),
    })

    const user = await this.usersService.findUserByEmail(payload.email)
    if (!user || user.passwordResetToken !== token) {
      throw new BadRequestException('Invalid password reset token')
    }
    if (new Date() > new Date(user.passwordResetTokenExpiresAt)) {
      throw new BadRequestException('Password reset token has expired')
    }
    if (user.passwordInit === newPassword) {
      throw new BadRequestException(
        'New password cannot be the same as the initial password',
      )
    }
    const hashedPassword = await this.hashPassword(newPassword)
    await this.drizzle.db.execute(sql`
      UPDATE "Users"
      SET "password" = ${hashedPassword}, "passwordInit" = ${newPassword}, "passwordResetToken" = null, "passwordResetTokenExpires" = null
      WHERE "pid" = ${user.pid};
    `)
  }
}
