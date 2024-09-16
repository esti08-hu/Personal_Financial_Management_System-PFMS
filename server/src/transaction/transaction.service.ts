import { Injectable } from "@nestjs/common";
import { count, desc, eq, sql, sum } from "drizzle-orm";
import { databaseSchema } from "src/database/database-schema";
import { CreateTransactionDto, UpdateTransactionDto } from "./transaction.dto";
import { DrizzleService } from "src/database/drizzle.service";

@Injectable()
export class TransactionService {
  constructor(private drizzle: DrizzleService) {}
  async getResentTransactions(userId: number) {
    return await this.drizzle.db
      .select()
      .from(databaseSchema.transactions)
      .where(eq(databaseSchema.transactions.userId, userId))
      .orderBy(desc(databaseSchema.transactions.date))
      .limit(2);
  }

  async getBalance(userId: number) {
    const result = await this.drizzle.db
      .select({ balance: sum(databaseSchema.transactions.amount) })
      .from(databaseSchema.transactions)
      .where(eq(databaseSchema.transactions.userId, userId));

    return result[0]?.balance || 0;
  }

  async getTransactionsCount() {
    const result = await this.drizzle.db
      .select({ count: count() })
      .from(databaseSchema.transactions);

    return result[0]?.count || 0;
  }

  async getUserTransactionsCount(userId: number) {
    const result = await this.drizzle.db
      .select({ count: count() })
      .from(databaseSchema.transactions)
      .where(eq(databaseSchema.transactions.userId, userId));

    return result[0]?.count || 0;
  }

  async createTransaction(createTransactionDto: CreateTransactionDto) {
    const { userId, type, amount, date, description } = createTransactionDto;

    const result = await this.drizzle.db.execute(sql`
        INSERT INTO "Transactions" ("userId", "type", "amount","data", "description")
        VALUES (${userId}, ${type}, ${amount},${date}, ${description});
    `);

    return result[0]; // Drizzle returns an array, we return the first entry
  }

  async updateTransaction(
    id: number,
    updateTransactionDto: UpdateTransactionDto
  ) {
    const { type, amount, date, description } = updateTransactionDto;

    const result = await this.drizzle.db
      .update(databaseSchema.transactions)
      .set({
        type,
        amount,
        date: new Date(date).toISOString(),
      })
      .where(eq(databaseSchema.transactions.id, id))
      .returning();

    return result[0]; // Return the updated transaction
  }

  async deleteTransaction(id: number) {
    await this.drizzle.db
      .delete(databaseSchema.transactions)
      .where(eq(databaseSchema.transactions.id, id));
  }
}
