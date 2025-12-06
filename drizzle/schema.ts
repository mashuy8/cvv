import { mysqlTable, int, varchar, text, boolean, timestamp, mysqlEnum } from "drizzle-orm/mysql-core";

// Admin users for dashboard login
export const adminUsers = mysqlTable("admin_users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 256 }).notNull(),
  role: mysqlEnum("role", ["user", "admin"]).notNull().default("admin"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow().onUpdateNow(),
  lastSignedIn: timestamp("lastSignedIn").notNull().defaultNow(),
});

// Script users for external script authentication
export const scriptUsers = mysqlTable("script_users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 256 }).notNull(),
  isActive: boolean("isActive").notNull().default(true),
  maxDailyChecks: int("maxDailyChecks").default(1000),
  todayChecks: int("todayChecks").default(0),
  totalChecks: int("totalChecks").default(0),
  successfulChecks: int("successfulChecks").default(0),
  failedChecks: int("failedChecks").default(0),
  lastCheckAt: timestamp("lastCheckAt"),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow().onUpdateNow(),
});

// Card check results
export const cardResults = mysqlTable("card_results", {
  id: int("id").primaryKey().autoincrement(),
  scriptUserId: int("scriptUserId").notNull(),
  cardNumber: varchar("cardNumber", { length: 32 }).notNull(),
  expiryMonth: varchar("expiryMonth", { length: 4 }).notNull(),
  expiryYear: varchar("expiryYear", { length: 4 }).notNull(),
  cvv: varchar("cvv", { length: 8 }),
  status: mysqlEnum("status", ["ACTIVE", "DECLINED", "ERROR"]).notNull(),
  message: text("message"),
  bin: varchar("bin", { length: 8 }),
  cardType: varchar("cardType", { length: 32 }),
  bank: varchar("bank", { length: 128 }),
  country: varchar("country", { length: 64 }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

// Activity logs
export const activityLogs = mysqlTable("activity_logs", {
  id: int("id").primaryKey().autoincrement(),
  scriptUserId: int("scriptUserId"),
  adminUserId: int("adminUserId"),
  action: varchar("action", { length: 64 }).notNull(),
  details: text("details"),
  ipAddress: varchar("ipAddress", { length: 64 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

// Script sessions
export const scriptSessions = mysqlTable("script_sessions", {
  id: int("id").primaryKey().autoincrement(),
  scriptUserId: int("scriptUserId").notNull(),
  token: varchar("token", { length: 512 }).notNull().unique(),
  isValid: boolean("isValid").notNull().default(true),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type ScriptUser = typeof scriptUsers.$inferSelect;
export type CardResult = typeof cardResults.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type ScriptSession = typeof scriptSessions.$inferSelect;
