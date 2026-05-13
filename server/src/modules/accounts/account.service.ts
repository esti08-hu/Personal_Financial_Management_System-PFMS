import { Injectable } from '@nestjs/common'
import { and, asc, count, desc, eq, ilike, lte, sql, sum, gte } from 'drizzle-orm'
import { databaseSchema } from 'src/database/database-schema'
import { DrizzleService } from 'src/database/drizzle.service'
import { CreateAccountDto, UpdateAccountDto } from './account.dto'
import { AccountFilterDto } from 'src/common/dto/filter.dto'
import type { PaginatedResult } from 'src/common/dto/pagination.dto'

@Injectable()
export class AccountService {
  constructor(private drizzle: DrizzleService) {}

  async getUserAccounts(userId: string) {
    return await this.drizzle.db
      .select()
      .from(databaseSchema.account)
      .where(eq(databaseSchema.account.userId, userId))
      .orderBy(desc(databaseSchema.account.createdAt))
  }

  async getUserAccountsPaginated(
    userId: string,
    filters: AccountFilterDto,
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

    const conditions = [eq(databaseSchema.account.userId, userId)]
    if (type) conditions.push(eq(databaseSchema.account.type, type))
    if (search) conditions.push(ilike(databaseSchema.account.title, `%${search}%`))

    if (cursor) {
      const cursorDate = new Date(cursor)
      if (sortOrder === 'asc') {
        conditions.push(gte(databaseSchema.account.createdAt, cursorDate))
      } else {
        conditions.push(lte(databaseSchema.account.createdAt, cursorDate))
      }
    }

    const whereClause = and(...conditions)
    const sortColumn =
      sortBy === 'balance'
        ? databaseSchema.account.balance
        : sortBy === 'title'
        ? databaseSchema.account.title
        : databaseSchema.account.createdAt
    const orderFn = sortOrder === 'asc' ? asc : desc

    const [totalResult, items] = await Promise.all([
      this.drizzle.db
        .select({ count: count() })
        .from(databaseSchema.account)
        .where(whereClause),
      this.drizzle.db
        .select()
        .from(databaseSchema.account)
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

  async getBalance(userId: string) {
    const result = await this.drizzle.db
      .select({ balance: sum(databaseSchema.account.balance) })
      .from(databaseSchema.account)
      .where(eq(databaseSchema.account.userId, userId))
    return result[0]?.balance || 0
  }

  async createAccount(createAccountDto: CreateAccountDto) {
    const { userId, title, type, balance } = createAccountDto

    const [created] = await this.drizzle.db
      .insert(databaseSchema.account)
      .values({ userId, title, type, balance })
      .returning()
    return created
  }

  async updateAccount(id: string, updateAccountDto: UpdateAccountDto) {
    const { type, date, balance, title } = updateAccountDto

    const result = await this.drizzle.db.execute(sql`
        UPDATE "Accounts"
        SET "type" = ${type}, "balance" = ${balance}, "title" = ${title}
        WHERE id = ${id}
      `)
    return result[0]
  }

  async deleteAccount(id: string) {
    await this.drizzle.db
      .delete(databaseSchema.account)
      .where(eq(databaseSchema.account.id, id))
  }
}
