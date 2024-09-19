import { Injectable } from "@nestjs/common";
import { eq, sql } from "drizzle-orm";
import { databaseSchema } from "src/database/database-schema";
import { DrizzleService } from "src/database/drizzle.service";
import { CreateAccountDto, UpdateAccountDto } from "./account.dto";

@Injectable()
export class AccountService {
  constructor(private drizzle: DrizzleService) {}

  async getUserAccounts(userId: number) {
    return await this.drizzle.db
      .select()
      .from(databaseSchema.account)
      .where(eq(databaseSchema.account.userId, userId));
  }

  async createAccount(createAccountDto: CreateAccountDto) {
    const { userId, title, type, balance } = createAccountDto;

    const result = await this.drizzle.db.execute(sql`
          INSERT INTO "Accounts" ("user_id", "type", "balance", "title")
          VALUES (${userId}, ${type}, ${balance}, ${title});
      `);
    return result[0];
  }

  async updateAccount(id: number, updateAccountDto: UpdateAccountDto) {
    const { type, balance, title } = updateAccountDto;

    const result = await this.drizzle.db.execute(sql`
        UPDATE "Accounts" 
        SET "type" = ${type}, "balance" = ${balance}, "title" = ${title}
        WHERE id = ${id}
      `);
    return result[0];
  }

  async deleteAccount(id: number) {
    await this.drizzle.db
      .delete(databaseSchema.account)
      .where(eq(databaseSchema.account.id, id));
  }
}
