import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { SignJWT } from "jose";
import { router, publicProcedure, protectedProcedure } from "./trpc";
import { getAllScriptUsers, getScriptUserById, createScriptUser, updateScriptUser, deleteScriptUser, getCardResults, getCardResultsCount, getRecentResults, getActivityLogs, getStatistics, invalidateUserSessions, getAdminUserByUsername, logActivity, deleteCardResult, deleteCardResults, getDistinctCountries, clearActivityLogs } from "./db";
import { hashPassword, verifyPassword } from "./crypto";

const COOKIE_NAME = "app_session";

function getCookieSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-change-this");
}

export const appRouter = router({
  auth: router({
    me: publicProcedure.query(({ ctx }) => ctx.user),
    
    login: publicProcedure
      .input(z.object({ username: z.string().min(1), password: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const user = await getAdminUserByUsername(input.username);
        if (!user || !verifyPassword(input.password, user.passwordHash)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
        }
        
        await logActivity({ adminUserId: user.id, action: "admin_login", details: `تسجيل دخول: ${user.username}`, ipAddress: ctx.req.ip || "" });
        
        const token = await new SignJWT({ adminId: user.id, username: user.username })
          .setProtectedHeader({ alg: "HS256" })
          .setExpirationTime("7d")
          .sign(getCookieSecret());
        
        ctx.res.cookie(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
        return { success: true, user: { id: user.id, username: user.username } };
      }),
    
    logout: publicProcedure.mutation(async ({ ctx }) => {
      if (ctx.user) await logActivity({ adminUserId: ctx.user.id, action: "admin_logout", details: `تسجيل خروج: ${ctx.user.username}` });
      ctx.res.clearCookie(COOKIE_NAME);
      return { success: true };
    }),
  }),

  scriptUsers: router({
    list: protectedProcedure.query(() => getAllScriptUsers()),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => getScriptUserById(input.id)),
    
    create: protectedProcedure
      .input(z.object({ username: z.string().min(3), password: z.string().min(6), maxDailyChecks: z.number().optional().default(1000), expiresAt: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const user = await createScriptUser({ username: input.username, passwordHash: hashPassword(input.password), maxDailyChecks: input.maxDailyChecks, expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined });
        await logActivity({ adminUserId: ctx.user.id, action: "create_script_user", details: `إنشاء مستخدم: ${input.username}` });
        return user;
      }),
    
    update: protectedProcedure
      .input(z.object({ id: z.number(), isActive: z.boolean().optional(), maxDailyChecks: z.number().optional(), expiresAt: z.string().nullable().optional(), password: z.string().min(6).optional() }))
      .mutation(async ({ ctx, input }) => {
        const { id, password, expiresAt, ...data } = input;
        const updateData: any = { ...data };
        if (password) updateData.passwordHash = hashPassword(password);
        if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
        await updateScriptUser(id, updateData);
        await logActivity({ adminUserId: ctx.user.id, action: "update_script_user", details: `تحديث مستخدم ID: ${id}` });
        return { success: true };
      }),
    
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      await invalidateUserSessions(input.id);
      await deleteScriptUser(input.id);
      await logActivity({ adminUserId: ctx.user.id, action: "delete_script_user", details: `حذف مستخدم ID: ${input.id}` });
      return { success: true };
    }),
    
    resetPassword: protectedProcedure.input(z.object({ id: z.number(), newPassword: z.string().min(6) })).mutation(async ({ ctx, input }) => {
      await updateScriptUser(input.id, { passwordHash: hashPassword(input.newPassword) });
      await invalidateUserSessions(input.id);
      await logActivity({ adminUserId: ctx.user.id, action: "reset_password", details: `إعادة تعيين كلمة مرور ID: ${input.id}` });
      return { success: true };
    }),
  }),

  results: router({
    list: protectedProcedure
      .input(z.object({ scriptUserId: z.number().optional(), status: z.enum(["ACTIVE", "DECLINED", "ERROR"]).optional(), country: z.string().optional(), limit: z.number().optional().default(50), offset: z.number().optional().default(0) }))
      .query(async ({ input }) => {
        const results = await getCardResults(input);
        const total = await getCardResultsCount({ scriptUserId: input.scriptUserId, status: input.status, country: input.country });
        return { results, total };
      }),
    countries: protectedProcedure.query(() => getDistinctCountries()),
    recent: protectedProcedure.input(z.object({ limit: z.number().optional().default(50) })).query(({ input }) => getRecentResults(input.limit)),
    count: protectedProcedure.input(z.object({ scriptUserId: z.number().optional(), status: z.enum(["ACTIVE", "DECLINED", "ERROR"]).optional() })).query(({ input }) => getCardResultsCount(input)),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      await deleteCardResult(input.id);
      await logActivity({ adminUserId: ctx.user.id, action: "delete_result", details: `حذف نتيجة ID: ${input.id}` });
      return { success: true };
    }),
    deleteMany: protectedProcedure.input(z.object({ ids: z.array(z.number()) })).mutation(async ({ ctx, input }) => {
      await deleteCardResults(input.ids);
      await logActivity({ adminUserId: ctx.user.id, action: "delete_results", details: `حذف ${input.ids.length} نتيجة` });
      return { success: true, count: input.ids.length };
    }),
  }),

  activityLogs: router({
    list: protectedProcedure.input(z.object({ scriptUserId: z.number().optional(), limit: z.number().optional().default(100), offset: z.number().optional().default(0) })).query(({ input }) => getActivityLogs(input)),
    clear: protectedProcedure.mutation(async ({ ctx }) => {
      await clearActivityLogs();
      await logActivity({ adminUserId: ctx.user.id, action: "clear_logs", details: "مسح جميع السجلات" });
      return { success: true };
    }),
  }),

  statistics: router({
    overview: protectedProcedure.query(() => getStatistics()),
  }),
});

export type AppRouter = typeof appRouter;
