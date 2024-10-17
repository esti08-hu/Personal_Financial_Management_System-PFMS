import { Injectable } from '@nestjs/common'
import { desc, eq, sql, sum } from 'drizzle-orm'
import { databaseSchema } from 'src/database/database-schema'
import { DrizzleService } from 'src/database/drizzle.service'
import { CreateAccountDto, UpdateAccountDto } from './account.dto'

@Injectable()
export class AccountService {
  constructor(private drizzle: DrizzleService) {}

  async getUserAccounts(userId: number) {
    return await this.drizzle.db
      .select()
      .from(databaseSchema.account)
      .where(eq(databaseSchema.account.userId, userId))
      .orderBy(desc(databaseSchema.account.createdAt))
  }

  async getBalance(userId: number) {
    const result = await this.drizzle.db
      .select({ balance: sum(databaseSchema.account.balance) })
      .from(databaseSchema.account)
      .where(eq(databaseSchema.account.userId, userId))
    return result[0]?.balance || 0
  }

  async createAccount(createAccountDto: CreateAccountDto) {
    const { userId, title, type, balance } = createAccountDto

    const result = await this.drizzle.db.execute(sql`
          INSERT INTO "Accounts" ("user_id", "type", "balance", "title")
          VALUES (${userId}, ${type}, ${balance}, ${title});
      `)
    return result[0]
  }

  async updateAccount(id: number, updateAccountDto: UpdateAccountDto) {
    const { type, date, balance, title } = updateAccountDto
    console.log(updateAccountDto)

    const result = await this.drizzle.db.execute(sql`
        UPDATE "Accounts" 
        SET "type" = ${type}, "balance" = ${balance}, "title" = ${title}, "date" = ${date}
        WHERE id = ${id}
      `)
    return result[0]
  }

  async deleteAccount(id: number) {
    await this.drizzle.db
      .delete(databaseSchema.account)
      .where(eq(databaseSchema.account.id, id))
  }
}
