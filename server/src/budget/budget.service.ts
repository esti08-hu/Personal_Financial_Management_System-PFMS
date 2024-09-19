import { Injectable } from "@nestjs/common";
import { eq, sql, count } from "drizzle-orm";
import { databaseSchema } from "src/database/database-schema";
import { DrizzleService } from "src/database/drizzle.service";
import { CreateBudgetDto, UpdateBudgetDto } from "src/budget/budget.dto";

@Injectable()
export class BudgetService {
  constructor(private drizzle: DrizzleService) {}

  async getUserBudgets(userId: number) {
    return await this.drizzle.db
      .select()
      .from(databaseSchema.budget)
      .where(eq(databaseSchema.budget.userId, userId));
  }
  async createBudget(createBudgetDto: CreateBudgetDto) {
    const { userId, title, type, amount, date } = createBudgetDto;

    const result = await this.drizzle.db.execute(sql`
          INSERT INTO "Budgets" ("user_id", "type", "amount", "date", "title")
          VALUES (${userId}, ${type}, ${amount}, ${new Date(date).toISOString()}, ${title});
      `);
    return result[0];
  }

  async updateBudget(
    id: number,
    updateBudgetDto: UpdateBudgetDto
  ) {
    const { type, amount, date, title } = updateBudgetDto;
    const result = await this.drizzle.db.execute(sql`
        UPDATE "Budgets" 
        SET "type" = ${type}, "amount" = ${amount}, "date" = ${new Date(date).toISOString()}, "title" = ${title}
        WHERE id = ${id}
      `);
    return result[0];
  }

  async deleteBudget(id: number) {
    await this.drizzle.db
      .delete(databaseSchema.budget)
      .where(eq(databaseSchema.budget.id, id));
  }

  async getUserBudgetCount(userId: number) {
    const result = await this.drizzle.db
      .select({ count: count() })
      .from(databaseSchema.budget)
      .where(eq(databaseSchema.budget.userId, userId));

    return result[0]?.count || 0;
  }
}
