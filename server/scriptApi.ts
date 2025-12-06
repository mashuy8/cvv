import { Router, Request, Response } from "express";
import { getScriptUserByUsername, getScriptUserById, addCardResult, logActivity, createScriptSession, getValidSession, invalidateSession, incrementScriptUserChecks } from "./db";
import { verifyPassword, generateToken } from "./crypto";

const router = Router();

// BIN Lookup
async function lookupBIN(bin: string) {
  try {
    const response = await fetch(`https://lookup.binlist.net/${bin}`, { headers: { 'Accept-Version': '3' } });
    if (response.ok) {
      const data = await response.json();
      return { cardType: data.type || '', bank: data.bank?.name || '', country: data.country?.name || '', brand: data.brand || data.scheme || '' };
    }
  } catch (e) {}
  return { cardType: '', bank: '', country: '', brand: '' };
}

// POST /api/script/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.json({ success: false, error: "Username and password required" });

    const user = await getScriptUserByUsername(username);
    if (!user) return res.json({ success: false, error: "Invalid credentials" });
    if (!user.isActive) return res.json({ success: false, error: "Account is disabled" });
    if (user.expiresAt && new Date(user.expiresAt) < new Date()) return res.json({ success: false, error: "Account has expired" });

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      await logActivity({ scriptUserId: user.id, action: "LOGIN_FAILED", details: "Invalid password", ipAddress: req.ip || "" });
      return res.json({ success: false, error: "Invalid credentials" });
    }

    const token = generateToken(64);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await createScriptSession({ scriptUserId: user.id, token, expiresAt });
    await logActivity({ scriptUserId: user.id, action: "LOGIN_SUCCESS", details: "User logged in", ipAddress: req.ip || "" });

    res.json({
      success: true, token,
      user: { id: user.id, username: user.username, maxDailyChecks: user.maxDailyChecks, todayChecks: user.todayChecks, remainingChecks: (user.maxDailyChecks || 1000) - (user.todayChecks || 0) }
    });
  } catch (error) {
    console.error("[Script API] Login error:", error);
    res.json({ success: false, error: "Internal server error" });
  }
});

// POST /api/script/verify
router.post("/verify", async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) return res.json({ success: false, error: "Token required" });

    const session = await getValidSession(token);
    if (!session) return res.json({ success: false, error: "Invalid or expired session" });

    const user = await getScriptUserById(session.scriptUserId);
    if (!user || !user.isActive) return res.json({ success: false, error: "User not found or disabled" });

    res.json({
      success: true,
      user: { id: user.id, username: user.username, maxDailyChecks: user.maxDailyChecks, todayChecks: user.todayChecks, remainingChecks: (user.maxDailyChecks || 1000) - (user.todayChecks || 0) }
    });
  } catch (error) {
    res.json({ success: false, error: "Internal server error" });
  }
});

// POST /api/script/result
router.post("/result", async (req: Request, res: Response) => {
  try {
    const { token, card } = req.body;
    if (!token || !card) return res.json({ success: false, error: "Token and card data required" });

    const session = await getValidSession(token);
    if (!session) return res.json({ success: false, error: "Invalid or expired session" });

    const user = await getScriptUserById(session.scriptUserId);
    if (!user || !user.isActive) return res.json({ success: false, error: "User not found or disabled" });
    if ((user.todayChecks || 0) >= (user.maxDailyChecks || 1000)) return res.json({ success: false, error: "Daily check limit reached" });

    const bin = card.cardNumber?.substring(0, 6) || "";
    const binInfo = await lookupBIN(bin);

    const result = await addCardResult({
      scriptUserId: user.id, cardNumber: card.cardNumber, expiryMonth: card.expiryMonth, expiryYear: card.expiryYear,
      cvv: card.cvv || "", status: card.status, message: card.message || "", bin,
      cardType: binInfo.cardType || card.cardType || "", bank: binInfo.bank || card.bank || "", country: binInfo.country || card.country || ""
    });

    const isSuccess = card.status === "ACTIVE";
    await incrementScriptUserChecks(user.id, isSuccess);
    await logActivity({ scriptUserId: user.id, action: isSuccess ? "CHECK_SUCCESS" : "CHECK_FAILED", details: `Card: ${bin}****${card.cardNumber?.slice(-4)} - ${card.status}`, ipAddress: req.ip || "" });

    res.json({ success: true, resultId: result.id, remainingChecks: (user.maxDailyChecks || 1000) - (user.todayChecks || 0) - 1 });
  } catch (error) {
    res.json({ success: false, error: "Internal server error" });
  }
});

// POST /api/script/logout
router.post("/logout", async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (token) {
      const session = await getValidSession(token);
      if (session) {
        await invalidateSession(token);
        await logActivity({ scriptUserId: session.scriptUserId, action: "LOGOUT", details: "User logged out", ipAddress: req.ip || "" });
      }
    }
    res.json({ success: true });
  } catch (error) {
    res.json({ success: true });
  }
});

// GET /api/script/status
router.get("/status", (req: Request, res: Response) => {
  res.json({ status: "online", timestamp: Date.now(), version: "2.0.0" });
});

export default router;
