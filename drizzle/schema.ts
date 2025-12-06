import { mysqlTable, int, varchar, text, boolean, timestamp, mysqlEnum } from "drizzle-orm/mysql-core";

// Admin users for dashboard login
export const adminUsers = mysqlTable("admin_users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 256 }).notNull(),
  role: mysqlEnum("role", ["user", "admin"]).notNull().default("admin"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  lastSignedIn: timestamp("last_signed_in").notNull().defaultNow(),
});

// Script users for external script authentication
export const scriptUsers = mysqlTable("script_users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 256 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  maxDailyChecks: int("max_daily_checks").default(1000),
  todayChecks: int("today_checks").default(0),
  totalChecks: int("total_checks").default(0),
  successfulChecks: int("successful_checks").default(0),
  failedChecks: int("failed_checks").default(0),
  lastCheckAt: timestamp("last_check_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

// Card check results
export const cardResults = mysqlTable("card_results", {
  id: int("id").primaryKey().autoincrement(),
  scriptUserId: int("script_user_id").notNull(),
  cardNumber: varchar("card_number", { length: 32 }).notNull(),
  expiryMonth: varchar("expiry_month", { length: 4 }).notNull(),
  expiryYear: varchar("expiry_year", { length: 4 }).notNull(),
  cvv: varchar("cvv", { length: 8 }),
  status: mysqlEnum("status", ["ACTIVE", "DECLINED", "ERROR"]).notNull(),
  message: text("message"),
  bin: varchar("bin", { length: 8 }),
  cardType: varchar("card_type", { length: 32 }),
  bank: varchar("bank", { length: 128 }),
  country: varchar("country", { length: 64 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Activity logs
export const activityLogs = mysqlTable("activity_logs", {
  id: int("id").primaryKey().autoincrement(),
  scriptUserId: int("script_user_id"),
  adminUserId: int("admin_user_id"),
  action: varchar("action", { length: 64 }).notNull(),
  details: text("details"),
  ipAddress: varchar("ip_address", { length: 64 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Script sessions
export const scriptSessions = mysqlTable("script_sessions", {
  id: int("id").primaryKey().autoincrement(),
  scriptUserId: int("script_user_id").notNull(),
  token: varchar("token", { length: 512 }).notNull().unique(),
  isValid: boolean("is_valid").notNull().default(true),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type ScriptUser = typeof scriptUsers.$inferSelect;
export type CardResult = typeof cardResults.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type ScriptSession = typeof scriptSessions.$inferSelect;
