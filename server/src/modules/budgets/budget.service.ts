import { Injectable } from '@nestjs/common'
import { and, asc, count, desc, eq, ilike, lte, sql, gte } from 'drizzle-orm'
import { CreateBudgetDto, UpdateBudgetDto } from './budget.dto'
import { databaseSchema } from 'src/database/database-schema'
import { DrizzleService } from 'src/database/drizzle.service'
import { BudgetFilterDto } from 'src/common/dto/filter.dto'
import type { PaginatedResult } from 'src/common/dto/pagination.dto'

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

  async getUserBudgetsPaginated(
    userId: string,
    filters: BudgetFilterDto,
  ): Promise<PaginatedResult<unknown>> {
    const {
      page = 1,
      limit = 20,
      cursor,
      type,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters

    const conditions = [eq(databaseSchema.budget.userId, userId)]
    if (type) conditions.push(eq(databaseSchema.budget.type, type))
    if (search) conditions.push(ilike(databaseSchema.budget.title, `%${search}%`))

    if (cursor) {
      const cursorDate = new Date(cursor)
      if (sortOrder === 'asc') {
        conditions.push(gte(databaseSchema.budget.createdAt, cursorDate))
      } else {
        conditions.push(lte(databaseSchema.budget.createdAt, cursorDate))
      }
    }

    const whereClause = and(...conditions)
    const sortColumn =
      sortBy === 'amount'
        ? databaseSchema.budget.amount
        : sortBy === 'title'
        ? databaseSchema.budget.title
        : databaseSchema.budget.createdAt
    const orderFn = sortOrder === 'asc' ? asc : desc

    const [totalResult, items] = await Promise.all([
      this.drizzle.db
        .select({ count: count() })
        .from(databaseSchema.budget)
        .where(whereClause),
      this.drizzle.db
        .select()
        .from(databaseSchema.budget)
        .where(whereClause)
        .orderBy(orderFn(sortColumn))
        .limit(limit)
        .offset(cursor ? 0 : (page - 1) * limit),
    ])

    const total = totalResult[0]?.count || 0
    const totalPages = Math.ceil(total / limit)

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        nextCursor: items.length > 0 ? items[items.length - 1].createdAt.toISOString() : undefined,
      },
    }
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
