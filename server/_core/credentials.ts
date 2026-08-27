import type { Express, Request, Response } from "express";
import { compare, hash } from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { Resend } from "resend";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { passwordResetTokens, users } from "../../drizzle/schema";
import { getDb } from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { sdk } from "./sdk";

const BCRYPT_COST = 12;
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;
const GENERIC_RESET_RESPONSE = { message: "If an active account matches that email, a password reset link has been sent." };

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}
function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function ensureOwnerCredentials() {
  const initialPassword = process.env.OWNER_INITIAL_PASSWORD?.trim();
  if (!initialPassword) return;
  if (initialPassword.length < 12) throw new Error("OWNER_INITIAL_PASSWORD must be at least 12 characters.");
  const db = await getDb();
  if (!db) throw new Error("Database is required to initialize owner credentials.");
  const [owner] = await db.select().from(users).where(eq(users.email, ENV.ownerEmail)).limit(1);
  if (!owner) throw new Error("Owner user was not found; refusing to create a disconnected identity.");
  if (owner.passwordHash) return;
  await db.update(users).set({ passwordHash: await hash(initialPassword, BCRYPT_COST), passwordChangedAt: new Date(), loginMethod: "credentials" }).where(eq(users.id, owner.id));
  console.log("[Auth] Owner credentials initialized. Remove OWNER_INITIAL_PASSWORD from the environment.");
}

export function registerCredentialRoutes(app: Express) {
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const email = normalizeEmail(req.body?.email);
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!email || password.length < 12) return res.status(400).json({ error: "Enter a valid email and password." });
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "Sign-in is temporarily unavailable." });
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const genericError = { error: "Email or password is incorrect. You can reset your password if needed." };
    if (!user?.passwordHash || user.accountStatus !== "active" || !(await compare(password, user.passwordHash))) return res.status(401).json(genericError);
    const token = await sdk.createSessionToken(user.openId, { name: user.name || "PrimeContractorOS User", expiresInMs: ONE_YEAR_MS, sessionVersion: user.sessionVersion ?? 0 });
    await db.update(users).set({ lastSignedIn: new Date(), lastActivityAt: new Date(), loginMethod: "credentials" }).where(eq(users.id, user.id));
    res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });
    return res.status(200).json({ success: true });
  });

  app.post("/api/auth/request-password-reset", async (req: Request, res: Response) => {
    const email = normalizeEmail(req.body?.email);
    if (!email) return res.status(200).json(GENERIC_RESET_RESPONSE);
    const db = await getDb();
    if (!db) return res.status(200).json(GENERIC_RESET_RESPONSE);
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user || user.accountStatus !== "active" || !ENV.resendApiKey) return res.status(200).json(GENERIC_RESET_RESPONSE);
    const rawToken = randomBytes(32).toString("base64url");
    await db.insert(passwordResetTokens).values({ userId: user.id, tokenHash: tokenHash(rawToken), expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) });
    const baseUrl = (process.env.APP_BASE_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;
    const resend = new Resend(ENV.resendApiKey);
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "PrimeContractorOS <noreply@primecontractoros.com>",
        to: email,
        subject: "Reset your PrimeContractorOS password",
        html: `<h2>Reset your password</h2><p>This link expires in 30 minutes and can be used once.</p><p><a href="${resetUrl}">Choose a new password</a></p><p>If you did not request this, you can ignore this email.</p>`,
      });
    } catch (error) {
      console.error("[Auth] Password reset email delivery failed", error);
    }
    return res.status(200).json(GENERIC_RESET_RESPONSE);
  });

  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    const rawToken = typeof req.body?.token === "string" ? req.body.token : "";
    const newPassword = typeof req.body?.password === "string" ? req.body.password : "";
    if (!rawToken || newPassword.length < 12) return res.status(400).json({ error: "The reset link or password is invalid." });
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "Password reset is temporarily unavailable." });
    const [record] = await db.select().from(passwordResetTokens).where(and(eq(passwordResetTokens.tokenHash, tokenHash(rawToken)), isNull(passwordResetTokens.usedAt), gt(passwordResetTokens.expiresAt, new Date()))).limit(1);
    if (!record) return res.status(400).json({ error: "This reset link is invalid or expired." });
    await db.transaction(async tx => {
      await tx.update(users).set({ passwordHash: await hash(newPassword, BCRYPT_COST), passwordChangedAt: new Date(), sessionVersion: sql`${users.sessionVersion} + 1`, loginMethod: "credentials" }).where(eq(users.id, record.userId));
      await tx.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, record.id));
    });
    res.clearCookie(COOKIE_NAME, getSessionCookieOptions(req));
    return res.status(200).json({ success: true });
  });
}
