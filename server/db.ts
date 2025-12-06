import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { eq, desc, and, sql, gte, lt } from "drizzle-orm";
import * as schema from "../drizzle/schema";

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export const db = drizzle(pool, { schema, mode: "default" });

// Admin Users
export async function getAdminUserByUsername(username: string) {
  const [user] = await db.select().from(schema.adminUsers).where(eq(schema.adminUsers.username, username));
  return user || null;
}

export async function getAdminUserById(id: number) {
  const [user] = await db.select().from(schema.adminUsers).where(eq(schema.adminUsers.id, id));
  return user || null;
}

// Script Users
export async function getAllScriptUsers() {
  return await db.select().from(schema.scriptUsers).orderBy(desc(schema.scriptUsers.createdAt));
}

export async function getScriptUserById(id: number) {
  const [user] = await db.select().from(schema.scriptUsers).where(eq(schema.scriptUsers.id, id));
  return user || null;
}

export async function getScriptUserByUsername(username: string) {
  const [user] = await db.select().from(schema.scriptUsers).where(eq(schema.scriptUsers.username, username));
  return user || null;
}

export async function createScriptUser(data: { username: string; passwordHash: string; maxDailyChecks?: number; expiresAt?: Date }) {
  const [result] = await db.insert(schema.scriptUsers).values(data);
  return { id: result.insertId, ...data };
}

export async function updateScriptUser(id: number, data: Partial<schema.ScriptUser>) {
  await db.update(schema.scriptUsers).set(data).where(eq(schema.scriptUsers.id, id));
}

export async function deleteScriptUser(id: number) {
  await db.delete(schema.scriptUsers).where(eq(schema.scriptUsers.id, id));
}

export async function incrementScriptUserChecks(id: number, isSuccess: boolean) {
  const user = await getScriptUserById(id);
  if (!user) return;
  
  await db.update(schema.scriptUsers).set({
    todayChecks: (user.todayChecks || 0) + 1,
    totalChecks: (user.totalChecks || 0) + 1,
    successfulChecks: isSuccess ? (user.successfulChecks || 0) + 1 : user.successfulChecks,
    failedChecks: !isSuccess ? (user.failedChecks || 0) + 1 : user.failedChecks,
    lastCheckAt: new Date(),
  }).where(eq(schema.scriptUsers.id, id));
}

// Card Results
export async function addCardResult(data: Omit<schema.CardResult, "id" | "createdAt">) {
  const [result] = await db.insert(schema.cardResults).values(data);
  return { id: result.insertId, ...data };
}

export async function getCardResults(filters: { scriptUserId?: number; status?: string; country?: string; limit?: number; offset?: number }) {
  let query = db.select().from(schema.cardResults);
  const conditions = [];
  
  if (filters.scriptUserId) conditions.push(eq(schema.cardResults.scriptUserId, filters.scriptUserId));
  if (filters.status) conditions.push(eq(schema.cardResults.status, filters.status as any));
  if (filters.country) conditions.push(eq(schema.cardResults.country, filters.country));
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  return await query.orderBy(desc(schema.cardResults.createdAt)).limit(filters.limit || 50).offset(filters.offset || 0);
}

export async function getCardResultsCount(filters: { scriptUserId?: number; status?: string; country?: string }) {
  const conditions = [];
  if (filters.scriptUserId) conditions.push(eq(schema.cardResults.scriptUserId, filters.scriptUserId));
  if (filters.status) conditions.push(eq(schema.cardResults.status, filters.status as any));
  if (filters.country) conditions.push(eq(schema.cardResults.country, filters.country));
  
  let query = db.select({ count: sql<number>`count(*)` }).from(schema.cardResults);
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  const [result] = await query;
  return result?.count || 0;
}

export async function getRecentResults(limit: number = 50) {
  return await db.select().from(schema.cardResults).orderBy(desc(schema.cardResults.createdAt)).limit(limit);
}

export async function deleteCardResult(id: number) {
  await db.delete(schema.cardResults).where(eq(schema.cardResults.id, id));
}

export async function deleteCardResults(ids: number[]) {
  for (const id of ids) {
    await db.delete(schema.cardResults).where(eq(schema.cardResults.id, id));
  }
}

export async function getDistinctCountries() {
  const results = await db.selectDistinct({ country: schema.cardResults.country }).from(schema.cardResults).where(sql`${schema.cardResults.country} IS NOT NULL AND ${schema.cardResults.country} != ''`);
  return results.map(r => r.country).filter(Boolean);
}

// Activity Logs
export async function logActivity(data: { scriptUserId?: number; adminUserId?: number; action: string; details?: string; ipAddress?: string; userAgent?: string }) {
  await db.insert(schema.activityLogs).values(data);
}

export async function getActivityLogs(filters: { scriptUserId?: number; limit?: number; offset?: number }) {
  let query = db.select().from(schema.activityLogs);
  
  if (filters.scriptUserId) {
    query = query.where(eq(schema.activityLogs.scriptUserId, filters.scriptUserId)) as any;
  }
  
  return await query.orderBy(desc(schema.activityLogs.createdAt)).limit(filters.limit || 100).offset(filters.offset || 0);
}

export async function clearActivityLogs() {
  await db.delete(schema.activityLogs);
}

// Sessions
export async function createScriptSession(data: { scriptUserId: number; token: string; expiresAt: Date }) {
  await db.insert(schema.scriptSessions).values(data);
}

export async function getValidSession(token: string) {
  const [session] = await db.select().from(schema.scriptSessions).where(
    and(
      eq(schema.scriptSessions.token, token),
      eq(schema.scriptSessions.isValid, true),
      gte(schema.scriptSessions.expiresAt, new Date())
    )
  );
  return session || null;
}

export async function invalidateSession(token: string) {
  await db.update(schema.scriptSessions).set({ isValid: false }).where(eq(schema.scriptSessions.token, token));
}

export async function invalidateUserSessions(scriptUserId: number) {
  await db.update(schema.scriptSessions).set({ isValid: false }).where(eq(schema.scriptSessions.scriptUserId, scriptUserId));
}

// Statistics
export async function getStatistics() {
  const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(schema.scriptUsers);
  const [activeUsersCount] = await db.select({ count: sql<number>`count(*)` }).from(schema.scriptUsers).where(eq(schema.scriptUsers.isActive, true));
  const [totalChecks] = await db.select({ count: sql<number>`count(*)` }).from(schema.cardResults);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [todayChecks] = await db.select({ count: sql<number>`count(*)` }).from(schema.cardResults).where(gte(schema.cardResults.createdAt, today));
  
  const [successfulChecks] = await db.select({ count: sql<number>`count(*)` }).from(schema.cardResults).where(eq(schema.cardResults.status, "ACTIVE"));
  const [failedChecks] = await db.select({ count: sql<number>`count(*)` }).from(schema.cardResults).where(eq(schema.cardResults.status, "DECLINED"));
  
  return {
    totalUsers: usersCount?.count || 0,
    activeUsers: activeUsersCount?.count || 0,
    totalChecks: totalChecks?.count || 0,
    todayChecks: todayChecks?.count || 0,
    successfulChecks: successfulChecks?.count || 0,
    failedChecks: failedChecks?.count || 0,
  };
}
