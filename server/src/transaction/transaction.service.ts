import { Injectable } from "@nestjs/common";
import { and, count, desc, eq, or, sql, sum } from "drizzle-orm";
import { databaseSchema, user } from "src/database/database-schema";
import { CreateTransactionDto, UpdateTransactionDto } from "./transaction.dto";
import { DrizzleService } from "src/database/drizzle.service";

@Injectable()
export class TransactionService {
  constructor(private drizzle: DrizzleService) {}
  async getResentTransactions(userId: number) {
    return await this.drizzle.db
      .select()
      .from(databaseSchema.transaction)
      .where(eq(databaseSchema.transaction.userId, userId))
      .orderBy(desc(databaseSchema.transaction.date))
      .limit(5);
  }

  async getBalance(userId: number) {
    const result = await this.drizzle.db
      .select({ balance: sum(databaseSchema.transaction.amount) })
      .from(databaseSchema.transaction)
      .where(eq(databaseSchema.transaction.userId, userId));

    return result[0]?.balance || 0;
  }

  async getTransactionsCount() {
    const result = await this.drizzle.db
      .select({ count: count() })
      .from(databaseSchema.transaction);

    return result[0]?.count || 0;
  }

  async getUserTransactionsCount(userId: number) {
    const result = await this.drizzle.db
      .select({ count: count() })
      .from(databaseSchema.transaction)
      .where(eq(databaseSchema.transaction.userId, userId));

    return result[0]?.count || 0;
  }

  async getUserTransactions(userId: number) {
    return await this.drizzle.db
      .select()
      .from(databaseSchema.transaction)
      .where(eq(databaseSchema.transaction.userId, userId));
  }

  async createTransaction(createTransactionDto: CreateTransactionDto) {
    const { userId, type, amount, date, description } = createTransactionDto;

    const result = await this.drizzle.db.execute(sql`
      INSERT INTO "Transactions" ("user_id", "type", "amount", "date", "description")
      VALUES (${userId}, ${type}, ${amount}, ${new Date(date).toISOString()}, ${description});
  `);
    return result[0];
  }

  async updateTransaction(
    id: number,
    updateTransactionDto: UpdateTransactionDto
  ) {
    const { type, amount, date, description } = updateTransactionDto;

    const result = await this.drizzle.db.execute(sql`
        UPDATE "Transactions" 
        SET "type" = ${type}, "amount" = ${amount}, "date" = ${new Date(date).toISOString()}, "description" = ${description}
        WHERE id = ${id}
      `);
    return result[0];
  }

  async deleteTransaction(id: number) {
    await this.drizzle.db
      .delete(databaseSchema.transaction)
      .where(eq(databaseSchema.transaction.id, id));
  }

  async getIncome(userId: number) {
    const result = await this.drizzle.db
      .select({ income: sum(databaseSchema.transaction.amount) })
      .from(databaseSchema.transaction)
      .where(
        and(
          eq(databaseSchema.transaction.userId, userId),
          eq(databaseSchema.transaction.type, "Deposit")
        )
      );

    return result[0]?.income || 0;
  }
  async getExpense(userId: number) {
    const result = await this.drizzle.db
      .select({ expense: sum(databaseSchema.transaction.amount) })
      .from(databaseSchema.transaction)
      .where(
        and(
          eq(databaseSchema.transaction.userId, userId),
          or(
            eq(databaseSchema.transaction.type, "Withdrawal"),
            eq(databaseSchema.transaction.type, "Transfer")
          )
        )
      );

    return result[0]?.expense || 0;
  }
  async getTopUsersByTransactionCount() {
    const result = await this.drizzle.db
      .select({
        userId: databaseSchema.transaction.userId,
        transactionCount:
          sql`COUNT(DISTINCT ${databaseSchema.transaction.id})`.as(
            "transactionCount"
          ),
        userName: databaseSchema.user.name,
        userEmail: databaseSchema.user.email,
        userStatus: databaseSchema.user.accountLockedUntil,
        budgetCount: sql`COUNT(DISTINCT ${databaseSchema.budget.id})`.as(
          "budgetCount"
        ), 
      })
      .from(databaseSchema.transaction)
      .leftJoin(
        databaseSchema.user,
        eq(databaseSchema.transaction.userId, databaseSchema.user.id)
      )
      .leftJoin(
        databaseSchema.budget,
        eq(databaseSchema.transaction.userId, databaseSchema.budget.userId)
      )
      .groupBy(
        databaseSchema.transaction.userId,
        databaseSchema.user.name,
        databaseSchema.user.email,
        databaseSchema.user.accountLockedUntil
      )
      .orderBy(desc(sql`COUNT(DISTINCT ${databaseSchema.transaction.id})`))
      .limit(5);

    return result;
  }
}
