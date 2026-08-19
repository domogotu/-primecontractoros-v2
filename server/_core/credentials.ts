import type { Express, Request, Response } from "express";
import { compare, hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { users } from "../../drizzle/schema";
import { getDb } from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { sdk } from "./sdk";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000;
const BCRYPT_COST = 12;

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
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
  await db.update(users).set({
    passwordHash: await hash(initialPassword, BCRYPT_COST),
    passwordChangedAt: new Date(),
    failedLoginAttempts: 0,
    lockedUntil: null,
    loginMethod: "credentials",
  }).where(eq(users.id, owner.id));
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
    const genericError = { error: "Email or password is incorrect." };
    if (!user?.passwordHash) return res.status(401).json(genericError);
    if (user.accountStatus !== "active") return res.status(403).json({ error: "This account is not active." });
    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) return res.status(429).json({ error: "Account temporarily locked. Try again later." });
    const valid = await compare(password, user.passwordHash);
    if (!valid) {
      const failed = (user.failedLoginAttempts ?? 0) + 1;
      await db.update(users).set({ failedLoginAttempts: failed, lockedUntil: failed >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCK_TIME_MS) : null }).where(eq(users.id, user.id));
      return res.status(401).json(genericError);
    }
    const token = await sdk.createSessionToken(user.openId, { name: user.name || "PrimeContractorOS User", expiresInMs: ONE_YEAR_MS });
    await db.update(users).set({ failedLoginAttempts: 0, lockedUntil: null, lastSignedIn: new Date(), lastActivityAt: new Date(), loginMethod: "credentials" }).where(eq(users.id, user.id));
    res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });
    return res.status(200).json({ success: true });
  });
}
