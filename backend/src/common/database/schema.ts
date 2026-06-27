import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const resumes = sqliteTable('resumes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email').notNull(),
  website: text('website'),
  experience: text('experience').notNull(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  emailVerified: integer('email_verified', { mode: 'boolean' })
    .notNull()
    .default(false),
  emailVerificationCode: text('email_verification_code'),
  twoFactorSecret: text('two_factor_secret'),
  twoFactorEnabled: integer('two_factor_enabled', { mode: 'boolean' })
    .notNull()
    .default(false),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const rateLimits = sqliteTable('rate_limits', {
  ipAddress: text('ip_address').primaryKey(),
  requestCount: integer('request_count').notNull().default(0),
  windowStartedAt: integer('window_started_at').notNull(),
  windowExpiresAt: integer('window_expires_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const schema = { resumes, users, rateLimits };

export type ResumeRow = typeof resumes.$inferSelect;
export type UserRow = typeof users.$inferSelect;
export type RateLimitRow = typeof rateLimits.$inferSelect;
