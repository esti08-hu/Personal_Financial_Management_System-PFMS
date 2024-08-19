import { boolean, pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const admin = pgTable('Admins', {
  id: serial('id').primaryKey(),
  pid: varchar('pid', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 256 }).notNull(),
  email: varchar('email', { length: 256 }).notNull().unique(),
  role: varchar('role', { length: 50 }).default('SUPERADMIN'),
  password: varchar('password', { length: 256 }).notNull(),
  refreshToken: varchar('refreshToken', { length: 512 }).notNull(),
});

// User table: Stores information about registered users
export const user = pgTable('Users', {
  id: serial('id').primaryKey(),
  pid: varchar('pid', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 256 }).notNull(),
  email: varchar('email', { length: 256 }).notNull().unique(),
  phone: varchar('phone', { length: 256 }).notNull().unique(),
  password: varchar('password', { length: 256 }).notNull(),
  passwordInit: varchar('passwordInit', { length: 256 }).notNull(),
  refreshToken: varchar('refreshToken', { length: 512 }).notNull(),
  isEmailConfirmed: boolean('isEmailConfirmed').default(false).notNull(),
});

// Database schema: Combines all tables and relations into a single object
export const databaseSchema = {
  admin,
  user,
};
