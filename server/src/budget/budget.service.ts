import { Injectable } from '@nestjs/common'
import { count, desc, eq } from 'drizzle-orm'
import { CreateBudgetDto, UpdateBudgetDto } from 'src/budget/budget.dto'
import { databaseSchema } from 'src/database/database-schema'
import { DrizzleService } from 'src/database/drizzle.service'

@Injectable()
export class BudgetService {
  constructor(private drizzle: DrizzleService) {}

  async getUserBudgets(userId: string) {
    return await this.drizzle.db
      .select()
      .from(databaseSchema.budget)
      .where(eq(databaseSchema.budget.userId, userId))
      .orderBy(desc(databaseSchema.budget.createdAt))
  }
  async createBudget(createBudgetDto: CreateBudgetDto) {
    const { userId, title, type, amount } = createBudgetDto

    const [created] = await this.drizzle.db
      .insert(databaseSchema.budget)
      .values({ userId, title, type, amount })
      .returning()
    return created
  }

  async updateBudget(id: string, updateBudgetDto: UpdateBudgetDto) {
    const { type, amount, title } = updateBudgetDto

    const [updated] = await this.drizzle.db
      .update(databaseSchema.budget)
      .set({ type, amount, title })
      .where(eq(databaseSchema.budget.id, id))
      .returning()
    return updated
  }

  async deleteBudget(id: string) {
    await this.drizzle.db
      .delete(databaseSchema.budget)
      .where(eq(databaseSchema.budget.id, id))
  }

  async getUserBudgetCount(userId: string) {
    const result = await this.drizzle.db
      .select({ count: count() })
      .from(databaseSchema.budget)
      .where(eq(databaseSchema.budget.userId, userId))

    return result[0]?.count || 0
  }
}
