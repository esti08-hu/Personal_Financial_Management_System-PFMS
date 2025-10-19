import { desc, relations, sql } from 'drizzle-orm'
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

//Admin table
export const admin = pgTable('Admins', {
  id: uuid('id').primaryKey().defaultRandom(),
  pid: varchar('pid', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 256 }).notNull(),
  email: varchar('email', { length: 256 }).notNull().unique(),
  role: varchar('role', { length: 50 }).default('ADMIN'),
  password: varchar('password', { length: 256 }).notNull(),
  refreshToken: varchar('refreshToken', { length: 512 }),
})

// User table
export const user = pgTable('Users', {
  id: uuid('id').primaryKey().defaultRandom(),
  pid: varchar('pid', { length: 50 }).notNull().unique(),
  role: varchar('role', { length: 50 }).default('USER'),
  name: varchar('name', { length: 256 }).notNull(),
  email: varchar('email', { length: 256 }).notNull().unique(),
  phone: varchar('phone', { length: 256 }).unique(),
  password: varchar('password', { length: 256 }),
  passwordInit: varchar('passwordInit', { length: 256 }),
  createdAt: timestamp('createdAt', { withTimezone: true }).default(sql`now()`),
  profilePicture: varchar('profilePicture', { length: 512 }),
  refreshToken: varchar('refreshToken', { length: 512 }),
  isEmailConfirmed: boolean('isEmailConfirmed').default(false).notNull(),
  isRegisteredWithGoogle: boolean('isRegisteredWithGoogle')
    .default(false)
    .notNull(),
  confirmationSentAt: timestamp('confirmationSentAt', { withTimezone: true }),
  passwordResetToken: varchar('passwordResetToken', { length: 512 }),
  passwordResetTokenExpires: timestamp('passwordResetTokenExpires', {
    withTimezone: true,
  }),
  passwordResetTokenUsed: boolean('passwordResetTokenUsed').default(false),
  failedLoginAttempts: integer('failedLoginAttempts').default(0).notNull(),
  accountLockedUntil: timestamp('accountLockedUntil', { withTimezone: true }),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
})

// Transactions table
export const transaction = pgTable('Transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id),
  accountId: uuid('account_id')
    .notNull()
    .references(() => account.id),
  type: varchar('type', { length: 50 }).notNull(),
  amount: integer('amount').notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).default(sql`now()`),
  description: varchar('description', { length: 255 }),
}, (table) => ({
  // Composite index: (user_id, createdAt DESC)
  userIdCreatedAtIdx: index('transaction_user_id_created_at_idx').on(
    table.userId,
    desc(table.createdAt),
  ),
}))

// Budget table
export const budget = pgTable('Budgets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id),
  title: varchar('title', { length: 256 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  amount: integer('amount').notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).default(sql`now()`),
}, (table) => ({
  userIdIdx: index('budget_user_id_idx').on(table.userId),
}))

// Account table
export const account = pgTable('Accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id),
  title: varchar('title', { length: 256 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  balance: integer('balance').notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).default(sql`now()`),
}, (table) => ({
  userIdIdx: index('account_user_id_idx').on(table.userId),
}))

// Conversation table
export const conversation = pgTable('Conversation', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id),
  createdAt: timestamp('createdAt', { withTimezone: true }).default(sql`now()`),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).default(sql`now()`),
  totalTurns: integer('total_turns').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  lastActivityAt: timestamp('last_activity_at', { withTimezone: true }).default(
    sql`now()`,
  ),
}, (table) => ({
  userIdLastActivityAtIdx: index('conversation_user_id_last_activity_at_idx').on(
    table.userId,
    desc(table.lastActivityAt)
  ),
}))

// Turn table
export const turn = pgTable('Turn', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id')
    .notNull()
    .references(() => conversation.id),
  userMessage: text('user_message').notNull(),
  assistantMessage: text('assistant_message'),
  intent: jsonb('intent'),
  aggregates: jsonb('aggregates'),
  isProcessed: boolean('is_processed').default(false).notNull(),
  isFallback: boolean('is_fallback').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).default(sql`now()`),
  processedAt: timestamp('processedAt', { withTimezone: true }),
}, (table) => ({
  conversationIdCreatedAtIdx: index('turn_conversation_id_created_at_idx').on(
    table.conversationId,
    desc(table.createdAt)
  ),
}))

// RateLimitUsage table
export const rateLimitUsage = pgTable('RateLimitUsage', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id),
  date: date('date').notNull(),
  geminiCallsUsed: integer('gemini_calls_used').default(0).notNull(),
  minuteCallsUsed: integer('minute_calls_used').default(0).notNull(),
  cacheHits: integer('cache_hits').default(0).notNull(),
  lastResetAt: timestamp('last_reset_at', { withTimezone: true }),
}, (table) => ({
  userIdDateIdx: index('rate_limit_usage_user_id_date_idx').on(
    table.userId,
    table.date
  ),
}))

// AnomalyThreshold table
export const anomalyThreshold = pgTable('AnomalyThreshold', {
  id: uuid('id').primaryKey().defaultRandom(),
  rateLimitMultiplier: integer('rate_limit_multiplier').default(2).notNull(),
  anomalyScoreThreshold: integer('anomaly_score_threshold')
    .default(10)
    .notNull(),
  consecutiveFailuresThreshold: integer('consecutive_failures_threshold')
    .default(5)
    .notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).default(sql`now()`),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).default(sql`now()`),
})

// Define the relationships
export const userRelations = relations(user, ({ many }) => ({
  transactions: many(transaction),
  budgets: many(budget),
  accounts: many(account),
  conversations: many(conversation),
  rateLimitUsages: many(rateLimitUsage),
}))

export const transactionRelations = relations(transaction, ({ one }) => ({
  user: one(user, { fields: [transaction.userId], references: [user.id] }),
  account: one(account, {
    fields: [transaction.accountId],
    references: [account.id],
  }),
}))

export const budgetRelations = relations(budget, ({ one }) => ({
  user: one(user, { fields: [budget.userId], references: [user.id] }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}))

// AI-related relations
export const conversationRelations = relations(
  conversation,
  ({ one, many }) => ({
    user: one(user, { fields: [conversation.userId], references: [user.id] }),
    turns: many(turn),
  }),
)

export const turnRelations = relations(turn, ({ one }) => ({
  conversation: one(conversation, {
    fields: [turn.conversationId],
    references: [conversation.id],
  }),
}))

export const rateLimitUsageRelations = relations(rateLimitUsage, ({ one }) => ({
  user: one(user, { fields: [rateLimitUsage.userId], references: [user.id] }),
}))

// AnomalyThreshold has no relations as it's a config table

// Database schema
export const databaseSchema = {
  admin,
  user,
  transaction,
  budget,
  account,
  conversation,
  turn,
  rateLimitUsage,
  anomalyThreshold,
  userRelations,
  transactionRelations,
  budgetRelations,
  accountRelations,
  conversationRelations,
  turnRelations,
  rateLimitUsageRelations,
}
