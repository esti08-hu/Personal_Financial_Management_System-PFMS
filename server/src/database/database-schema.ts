import { relations, sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

//Admin table
export const admin = pgTable("Admins", {
  id: serial("id").primaryKey(),
  pid: varchar("pid", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 256 }).notNull().unique(),
  role: varchar("role", { length: 50 }).default("ADMIN"),
  password: varchar("password", { length: 256 }).notNull(),
  refreshToken: varchar("refreshToken", { length: 512 }),
});

// User table
export const user = pgTable("Users", {
  id: serial("id").primaryKey(),
  pid: varchar("pid", { length: 50 }).notNull().unique(),
  role: varchar("role", { length: 50 }).default("USER"),
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 256 }).notNull().unique(),
  phone: varchar("phone", { length: 256 }).unique(),
  password: varchar("password", { length: 256 }),
  passwordInit: varchar("passwordInit", { length: 256 }),
  createdAt: timestamp("createdAt", { withTimezone: true }).default(sql`now()`),
  profilePicture: varchar("profilePicture", { length: 512 }),
  refreshToken: varchar("refreshToken", { length: 512 }),
  isEmailConfirmed: boolean("isEmailConfirmed").default(false).notNull(),
  isRegisteredWithGoogle: boolean("isRegisteredWithGoogle")
    .default(false)
    .notNull(),
  confirmationSentAt: timestamp("confirmationSentAt", { withTimezone: true }),
  passwordResetToken: varchar("passwordResetToken", { length: 512 }),
  passwordResetTokenExpires: timestamp("passwordResetTokenExpires", {
    withTimezone: true,
  }),
  passwordResetTokenUsed: boolean("passwordResetTokenUsed").default(false),
  failedLoginAttempts: integer("failedLoginAttempts").default(0).notNull(),
  accountLockedUntil: timestamp("accountLockedUntil", { withTimezone: true }),
  deletedAt: timestamp("deletedAt", { withTimezone: true }),
});

// Transactions table
export const transaction = pgTable("Transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => user.id),
  type: varchar("type", { length: 50 }).notNull(),
  amount: integer("amount").notNull(),
  date: varchar("date", { length: 50 }).notNull(),
  description: varchar("description", { length: 255 }),
});

// Budget table
export const budget = pgTable("Budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => user.id),
  title: varchar("title", { length: 256 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  amount: integer("amount").notNull(),
  date: varchar("date", { length: 50 }).notNull(),
});

// Account table
export const account = pgTable("Accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => user.id),
  title: varchar("title", { length: 256 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  balance: integer("balance").notNull(),
});

// Define the relationships
export const userRelations = relations(user, ({ many }) => ({
  transactions: many(transaction),
  budgets: many(budget),
  accounts: many(account),
}));

export const transactionRelations = relations(transaction, ({ one }) => ({
  user: one(user, { fields: [transaction.userId], references: [user.id] }),
}));

export const budgetRelations = relations(budget, ({ one }) => ({
  user: one(user, { fields: [budget.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

// Database schema
export const databaseSchema = {
  admin,
  user,
  transaction,
  budget,
  account,
  userRelations,
  transactionRelations,
  budgetRelations,
  accountRelations,
};
