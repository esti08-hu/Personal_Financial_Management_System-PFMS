import { Injectable, NotFoundException } from '@nestjs/common'
import { and, asc, count, desc, eq, gte, ilike, lte, or, sql, sum } from 'drizzle-orm'
import { databaseSchema, user } from 'src/database/database-schema'
import { DrizzleService } from 'src/database/drizzle.service'
import { CreateTransactionDto, UpdateTransactionDto } from './transaction.dto'
import { TransactionFilterDto } from 'src/common/dto/filter.dto'
import type { PaginatedResult } from 'src/common/dto/pagination.dto'

@Injectable()
export class TransactionService {
  constructor(private drizzle: DrizzleService) {}
  async getTransactionById(id: string) {
    return await this.drizzle.db.query.transaction.findFirst({
      where: eq(databaseSchema.transaction.id, id),
      with: {
        account: {
          columns: {
            title: true,
            balance: true,
          },
        },
      },
    })
  }

  async getRecentTransactions(userId: string) {
    return await this.drizzle.db
      .select()
      .from(databaseSchema.transaction)
      .where(eq(databaseSchema.transaction.userId, userId))
      .orderBy(desc(databaseSchema.transaction.createdAt))
      .limit(5)
  }

  async getTransactionsCount() {
    const result = await this.drizzle.db
      .select({ count: count() })
      .from(databaseSchema.transaction)

    return result[0]?.count || 0
  }

  async getUserTransactionsCount(userId: string) {
    const result = await this.drizzle.db
      .select({ count: count() })
      .from(databaseSchema.transaction)
      .where(eq(databaseSchema.transaction.userId, userId))

    return result[0]?.count || 0
  }

  async getUserTransactions(userId: string) {
    return await this.drizzle.db.query.transaction.findMany({
      where: eq(databaseSchema.transaction.userId, userId),
      orderBy: desc(databaseSchema.transaction.createdAt),
      with: {
        account: true,
      },
    })
  }

  async getUserTransactionsPaginated(userId: string, filters: TransactionFilterDto): Promise<PaginatedResult<unknown>> {
    const { page = 1, limit = 20, type, search, dateFrom, dateTo, amountMin, amountMax, sortBy = 'createdAt', sortOrder = 'desc' } = filters

    const conditions = [eq(databaseSchema.transaction.userId, userId)]
    if (type) conditions.push(eq(databaseSchema.transaction.type, type))
    if (search) conditions.push(ilike(databaseSchema.transaction.description, `%${search}%`))
    if (dateFrom) conditions.push(gte(databaseSchema.transaction.createdAt, new Date(dateFrom)))
    if (dateTo) conditions.push(lte(databaseSchema.transaction.createdAt, new Date(dateTo)))
    if (amountMin !== undefined) conditions.push(gte(databaseSchema.transaction.amount, amountMin))
    if (amountMax !== undefined) conditions.push(lte(databaseSchema.transaction.amount, amountMax))

    const whereClause = and(...conditions)

    const sortColumn = sortBy === 'amount' ? databaseSchema.transaction.amount : databaseSchema.transaction.createdAt
    const orderFn = sortOrder === 'asc' ? asc : desc

    const [totalResult, items] = await Promise.all([
      this.drizzle.db
        .select({ count: count() })
        .from(databaseSchema.transaction)
        .where(whereClause),
      this.drizzle.db.query.transaction.findMany({
        where: whereClause,
        orderBy: orderFn(sortColumn),
        limit,
        offset: (page - 1) * limit,
        with: { account: true },
      }),
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
        nextCursor: items.length > 0 ? items[items.length - 1].id : undefined,
      },
    }
  }

  async createTransaction(createTransactionDto: CreateTransactionDto) {
    const { userId, accountId, balance, type, amount, createdAt, description } =
      createTransactionDto

    return await this.drizzle.db.transaction(async (tx) => {
      const result = await tx.execute(sql`
        INSERT INTO "Transactions" ("user_id", "account_id", "type", "amount", "createdAt", "description")
        VALUES (${userId}, ${accountId}, ${type}, ${amount}, ${new Date(createdAt).toISOString()}, ${description})
        RETURNING *
      `)

      if (result.rowCount === 0) {
        await tx.rollback()
        throw new Error('Failed to create transaction')
      }

      const [updatedAccount] = await tx
        .update(databaseSchema.account)
        .set({ balance })
        .where(eq(databaseSchema.account.id, accountId))
        .returning()

      if (!updatedAccount) {
        await tx.rollback()
        throw new Error('Failed to update account balance')
      }

      return result.rows[0]
    })
  }

  async updateTransaction(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
  ) {
    const { type, accountId, amount, createdAt, description, balance } =
      updateTransactionDto

    await this.drizzle.db.transaction(async (tx) => {
      const result = await tx.execute(sql`
        UPDATE "Transactions"
        SET "type" = ${type}, "account_id" = ${accountId}, "amount" = ${amount},
            "createdAt" = ${new Date(createdAt).toISOString()}, "description" = ${description}
        WHERE id = ${id}
      `)

      if (result.rowCount === 0) {
        await tx.rollback()
        throw new Error('Failed to edit transaction')
      }

      if (balance !== undefined && balance !== null && !Number.isNaN(balance)) {
        const [updatedAccount] = await tx
          .update(databaseSchema.account)
          .set({ balance })
          .where(eq(databaseSchema.account.id, accountId))
          .returning()

        if (!updatedAccount) {
          await tx.rollback()
          throw new Error('Failed to update account balance')
        }
      }
    })

    return 'Transaction updated successfully'
  }

  async deleteTransaction(id: string) {
    const existing = await this.drizzle.db.query.transaction.findFirst({
      where: eq(databaseSchema.transaction.id, id),
      with: {
        account: {
          columns: { balance: true },
        },
      },
    })

    if (!existing) throw new NotFoundException('Transaction not found')

    const { type, amount, accountId, account } = existing
    let newBalance = account.balance
    if (type === 'Deposit') {
      newBalance -= amount
    } else if (type === 'Withdrawal' || type === 'Transfer') {
      newBalance += amount
    }

    await this.drizzle.db.transaction(async (tx) => {
      const result = await this.drizzle.db
        .delete(databaseSchema.transaction)
        .where(eq(databaseSchema.transaction.id, id))

      if (result.rowCount === 0) {
        await tx.rollback()
        throw new Error('Failed to delete transaction')
      }

      const [updatedAccount] = await this.drizzle.db
        .update(databaseSchema.account)
        .set({ balance: newBalance })
        .where(eq(databaseSchema.account.id, accountId))
        .returning()

      if (!updatedAccount) {
        await tx.rollback()
        throw new Error('Failed to update account balance')
      }
    })

    return 'Transaction deleted successfully'
  }

  async getIncome(userId: string) {
    const result = await this.drizzle.db
      .select({ income: sum(databaseSchema.transaction.amount) })
      .from(databaseSchema.transaction)
      .where(
        and(
          eq(databaseSchema.transaction.userId, userId),
          eq(databaseSchema.transaction.type, 'Deposit'),
        ),
      )

    return result[0]?.income || 0
  }
  async getExpense(userId: string) {
    const result = await this.drizzle.db
      .select({ expense: sum(databaseSchema.transaction.amount) })
      .from(databaseSchema.transaction)
      .where(
        and(
        eq(databaseSchema.transaction.userId, userId),
          or(
            eq(databaseSchema.transaction.type, 'Withdrawal'),
            eq(databaseSchema.transaction.type, 'Transfer'),
          ),
        ),
      )

    return result[0]?.expense || 0
  }
  async getTopUsersByTransactionCount() {
    const result = await this.drizzle.db
      .select({
        userId: databaseSchema.transaction.userId,
        transactionCount:
          sql`COUNT(DISTINCT ${databaseSchema.transaction.id})`.as(
            'transactionCount',
          ),
        userName: databaseSchema.user.name,
        userEmail: databaseSchema.user.email,
        userStatus: databaseSchema.user.accountLockedUntil,
        budgetCount: sql`COUNT(DISTINCT ${databaseSchema.budget.id})`.as(
          'budgetCount',
        ),
      })
      .from(databaseSchema.transaction)
      .leftJoin(
        databaseSchema.user,
        eq(databaseSchema.transaction.userId, databaseSchema.user.id),
      )
      .leftJoin(
        databaseSchema.budget,
        eq(databaseSchema.transaction.userId, databaseSchema.budget.userId),
      )
      .groupBy(
        databaseSchema.transaction.userId,
        databaseSchema.user.name,
        databaseSchema.user.email,
        databaseSchema.user.accountLockedUntil,
      )
      .orderBy(desc(sql`COUNT(DISTINCT ${databaseSchema.transaction.id})`))
      .limit(5)

    return result
  }
}
