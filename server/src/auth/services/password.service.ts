import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { UsersService } from 'src/users/users.service'
import { DrizzleService } from '../../database/drizzle.service'

@Injectable()
export class PasswordService {
  constructor(
    private drizzle: DrizzleService,
    private usersService: UsersService,
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
}
