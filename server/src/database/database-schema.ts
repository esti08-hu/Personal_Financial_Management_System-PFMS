import { boolean, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const admin = pgTable("Admins", {
  id: serial("id").primaryKey(),
  pid: varchar("pid", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 256 }).notNull().unique(),
  role: varchar("role", { length: 50 }).default("SUPERADMIN"),
  password: varchar("password", { length: 256 }).notNull(),
  refreshToken: varchar("refreshToken", { length: 512 }),
});

// User table: Stores information about registered users
export const user = pgTable("Users", {
  id: serial("id").primaryKey(),
  pid: varchar("pid", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 256 }).notNull().unique(),
  phone: varchar("phone", { length: 256 }).unique(),
  password: varchar("password", { length: 256 }),
  passwordInit: varchar("passwordInit", { length: 256 }),
  profilePicture: varchar("profilePicture", { length: 512 }),
  refreshToken: varchar("refreshToken", { length: 512 }),
  isEmailConfirmed: boolean("isEmailConfirmed").default(false).notNull(),
  isRegisteredWithGoogle: boolean("isRegisteredWithGoogle")
    .default(false)
    .notNull(),
  confirmationSentAt: timestamp("confirmationSentAt", {
    withTimezone: true,
  }),
});

// Database schema: Combines all tables and relations into a single object
export const databaseSchema = {
  admin,
  user,
};
