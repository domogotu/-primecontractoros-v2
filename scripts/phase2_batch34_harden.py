from pathlib import Path

# Replace batch3 with a type-safe/authorization-safe version.
Path('server/batch3Router.ts').write_text(r'''import { randomBytes } from "node:crypto";
import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { planFeatures, emailTemplates, invites } from "../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { requireWorkspaceId } from "./workspaceMiddleware";
import { enforcePermission } from "./rbacMiddleware";
import { logAudit } from "./featureRouter";

function requireDb<T>(db: T | null): T {
  if (!db) throw new Error("Database not available");
  return db;
}

export const planFeaturesRouter = router({
  getMatrix: protectedProcedure.query(async () => {
    const db = requireDb(await getDb());
    return db.select().from(planFeatures);
  }),
  list: protectedProcedure.query(async () => {
    const db = requireDb(await getDb());
    return db.select().from(planFeatures);
  }),
});

// Email templates are platform-wide records. Only platform admins may mutate or enumerate them.
export const emailTemplatesRouter = router({
  list: adminProcedure.query(async () => {
    const db = requireDb(await getDb());
    return db.select().from(emailTemplates).orderBy(desc(emailTemplates.createdAt));
  }),
  create: adminProcedure.input(z.object({ name: z.string().min(1), subject: z.string().min(1), body: z.string(), category: z.string().optional() })).mutation(async ({ input }) => {
    const db = requireDb(await getDb());
    await db.insert(emailTemplates).values({
      templateKey: input.name.toLowerCase().trim().replace(/\s+/g, "_"),
      subject: input.subject,
      htmlBody: input.body,
      isEnabled: true,
    });
    return { success: true };
  }),
  update: adminProcedure.input(z.object({ id: z.number(), name: z.string().optional(), subject: z.string().optional(), body: z.string().optional(), isEnabled: z.boolean().optional() })).mutation(async ({ input }) => {
    const db = requireDb(await getDb());
    const { id, name, body, ...rest } = input;
    const updateData: Record<string, unknown> = { ...rest };
    if (name !== undefined) updateData.templateKey = name.toLowerCase().trim().replace(/\s+/g, "_");
    if (body !== undefined) updateData.htmlBody = body;
    await db.update(emailTemplates).set(updateData).where(eq(emailTemplates.id, id));
    return { success: true };
  }),
  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = requireDb(await getDb());
    await db.delete(emailTemplates).where(eq(emailTemplates.id, input.id));
    return { success: true };
  }),
});

export const diagnosticsRouter = router({
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = requireDb(await getDb());
    const wsId = await requireWorkspaceId(ctx.user.id);
    await db.select({ id: invites.id }).from(invites).where(eq(invites.workspaceId, wsId)).limit(1);
    return { database: "connected", workspace: wsId, timestamp: new Date().toISOString(), version: "1.0.0", features: { onboarding: true, notes: true, timeline: true, subcontractors: true, vendors: true } };
  }),
  runCheck: protectedProcedure.input(z.object({ checkType: z.string() })).mutation(async ({ ctx, input }) => {
    const db = requireDb(await getDb());
    const wsId = await requireWorkspaceId(ctx.user.id);
    try {
      await db.select({ id: invites.id }).from(invites).where(eq(invites.workspaceId, wsId)).limit(1);
      return { checkType: input.checkType, status: "passed", details: "Database and workspace access verified", timestamp: new Date().toISOString() };
    } catch (error) {
      return { checkType: input.checkType, status: "failed", details: error instanceof Error ? error.message : "Diagnostic check failed", timestamp: new Date().toISOString() };
    }
  }),
});

// This legacy invite surface remains for compatibility, but user-management permission is mandatory.
export const invitesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = requireDb(await getDb());
    const { wsId } = await enforcePermission(ctx.user.id, "manage_users");
    return db.select().from(invites).where(eq(invites.workspaceId, wsId)).orderBy(desc(invites.createdAt));
  }),
  create: protectedProcedure.input(z.object({ email: z.string().email(), role: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const db = requireDb(await getDb());
    const { wsId } = await enforcePermission(ctx.user.id, "manage_users");
    const token = randomBytes(32).toString("hex");
    await db.insert(invites).values({ email: input.email, role: input.role || "member", workspaceId: wsId, invitedBy: ctx.user.id, token, status: "pending" });
    try { await logAudit(wsId, ctx.user.id, "create", "invites", 0, { email: input.email, role: input.role || "member" }); } catch {}
    return { success: true, token };
  }),
  revoke: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const db = requireDb(await getDb());
    const { wsId } = await enforcePermission(ctx.user.id, "manage_users");
    await db.update(invites).set({ status: "revoked" }).where(and(eq(invites.id, input.id), eq(invites.workspaceId, wsId)));
    try { await logAudit(wsId, ctx.user.id, "update", "invites", input.id, { status: "revoked" }); } catch {}
    return { success: true };
  }),
});
''')

# Patch batch4: source-record integrity, per-user settings isolation, and null DB guards in touched areas.
p = Path('server/batch4Router.ts')
s = p.read_text()
s = s.replace('generatedDocuments, flowdownReviews, customerAdoption, businessProfiles, users, workspaceSettings', 'generatedDocuments, flowdownReviews, customerAdoption, businessProfiles, users, workspaceSettings, contracts', 1)

# Guard flowdown create against cross-workspace contract references.
old = '''    const db = await getDb();\n    const { wsId } = await enforcePermission(ctx.user.id, "write");\n    await db.insert(flowdownReviews).values({ contractId: input.contractId, workspaceId: wsId, clauseReference: input.clauseReference, clauseText: input.clauseText || null, flowdownRequired: input.flowdownRequired || false, notes: input.notes || null, reviewStatus: "pending", reviewedBy: ctx.user.id });'''
new = '''    const db = await getDb();\n    if (!db) throw new Error("Database not available");\n    const { wsId } = await enforcePermission(ctx.user.id, "write");\n    const [contract] = await db.select({ id: contracts.id }).from(contracts).where(and(eq(contracts.id, input.contractId), eq(contracts.workspaceId, wsId))).limit(1);\n    if (!contract) throw new Error("Contract not found in this workspace");\n    await db.insert(flowdownReviews).values({ contractId: input.contractId, workspaceId: wsId, clauseReference: input.clauseReference, clauseText: input.clauseText || null, flowdownRequired: input.flowdownRequired || false, notes: input.notes || null, reviewStatus: "pending", reviewedBy: ctx.user.id });'''
if old not in s:
    raise SystemExit('flowdown create target missing')
s = s.replace(old, new, 1)

# Per-user profile settings: stop sharing one up.* namespace across an entire workspace.
s = s.replace("    const extSettings: Record<string, string | null> = {};\n    if (wsId) {", "    const extSettings: Record<string, string | null> = {};\n    const profilePrefix = `up.${ctx.user.id}.`;\n    if (wsId) {", 1)
s = s.replace("        if (s.settingKey.startsWith('up.')) {", "        if (s.settingKey.startsWith(profilePrefix)) {", 1)
for field in ['jobTitle','phone','bio','linkedIn','guidancePreference','reminderPreference','timezone','notifyOpportunities','notifyDeadlines','notifyCompliance','notifyMarketing']:
    s = s.replace(f"extSettings['up.{field}']", f"extSettings[`${{profilePrefix}}{field}`]")

s = s.replace("      if (wsId) {\n        const settingEntries: [string, string][] = [];", "      if (wsId) {\n        const profilePrefix = `up.${ctx.user.id}.`;\n        const settingEntries: [string, string][] = [];", 1)
for field in ['jobTitle','phone','bio','linkedIn','guidancePreference','reminderPreference','timezone','notifyOpportunities','notifyDeadlines','notifyCompliance','notifyMarketing']:
    s = s.replace(f"['up.{field}',", f"[`${{profilePrefix}}{field}`,")

p.write_text(s)

# Remove the obsolete duplicate router bundle after verifying the live app imports the individual routers.
Path('server/allBatchRouters.ts').unlink(missing_ok=True)

Path('server/phase2Batch34Hardening.test.ts').write_text(r'''import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const b3 = readFileSync(join(here, "batch3Router.ts"), "utf8");
const b4 = readFileSync(join(here, "batch4Router.ts"), "utf8");

describe("phase 2 batch3/4 hardening", () => {
  it("restricts platform-wide email templates to platform admins", () => {
    expect(b3).toContain("emailTemplatesRouter = router");
    expect(b3).toContain("list: adminProcedure");
    expect(b3).toContain("create: adminProcedure");
    expect(b3).toContain("update: adminProcedure");
    expect(b3).toContain("delete: adminProcedure");
  });

  it("requires user-management permission and cryptographic invite tokens", () => {
    expect(b3).toContain('enforcePermission(ctx.user.id, "manage_users")');
    expect(b3).toContain('randomBytes(32).toString("hex")');
    expect(b3).not.toContain("Math.random()");
  });

  it("prevents cross-workspace flowdown contract references", () => {
    expect(b4).toContain("eq(contracts.workspaceId, wsId)");
    expect(b4).toContain("Contract not found in this workspace");
  });

  it("isolates extended user profile settings per user", () => {
    expect(b4).toContain('const profilePrefix = `up.${ctx.user.id}.`;');
    expect(b4).toContain("s.settingKey.startsWith(profilePrefix)");
    expect(b4).not.toContain("extSettings['up.jobTitle']");
  });

  it("removes the stale duplicate all-batch router implementation", () => {
    expect(existsSync(join(here, "allBatchRouters.ts"))).toBe(false);
  });
});
''')
