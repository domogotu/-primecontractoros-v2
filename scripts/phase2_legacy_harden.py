from pathlib import Path

# Harden batch1 against current schema and workspace boundaries.
Path('server/batch1Router.ts').write_text('''import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { onboardingProgress, recordNotes, recordTimeline } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { logAudit } from "./featureRouter";
import { requireWorkspaceId } from "./workspaceMiddleware";
import { enforcePermission } from "./rbacMiddleware";

export const onboardingRouter = router({
  getProgress: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    const rows = await db.select().from(onboardingProgress).where(and(eq(onboardingProgress.userId, ctx.user.id), eq(onboardingProgress.workspaceId, wsId)));
    return rows[0] || null;
  }),
  updateStep: protectedProcedure.input(z.object({ step: z.string(), completed: z.boolean() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    const existing = await db.select().from(onboardingProgress).where(and(eq(onboardingProgress.userId, ctx.user.id), eq(onboardingProgress.workspaceId, wsId)));
    if (existing.length === 0) {
      await db.insert(onboardingProgress).values({ userId: ctx.user.id, workspaceId: wsId, completedSteps: JSON.stringify({ [input.step]: input.completed }), currentStep: input.step, completed: false });
    } else {
      const current = JSON.parse(existing[0].completedSteps || "{}");
      current[input.step] = input.completed;
      await db.update(onboardingProgress).set({ completedSteps: JSON.stringify(current), currentStep: input.step }).where(and(eq(onboardingProgress.userId, ctx.user.id), eq(onboardingProgress.workspaceId, wsId)));
    }
    try { await logAudit(wsId, ctx.user.id, "update", "onboarding", 0, input); } catch {}
    return { success: true };
  }),
});

export const recordNotesRouter = router({
  list: protectedProcedure.input(z.object({ recordType: z.string(), recordId: z.number() })).query(async ({ ctx, input }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    return db.select().from(recordNotes).where(and(eq(recordNotes.workspaceId, wsId), eq(recordNotes.targetType, input.recordType), eq(recordNotes.targetId, input.recordId))).orderBy(desc(recordNotes.createdAt));
  }),
  create: protectedProcedure.input(z.object({ recordType: z.string(), recordId: z.number(), content: z.string(), noteType: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    const { wsId } = await enforcePermission(ctx.user.id, "write");
    await db.insert(recordNotes).values({ workspaceId: wsId, targetType: input.recordType, targetId: input.recordId, noteText: input.content, authorId: ctx.user.id });
    try { await logAudit(wsId, ctx.user.id, "create", "recordNotes", 0, { recordType: input.recordType, recordId: input.recordId }); } catch {}
    return { success: true };
  }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    const { wsId } = await enforcePermission(ctx.user.id, "delete");
    await db.delete(recordNotes).where(and(eq(recordNotes.id, input.id), eq(recordNotes.workspaceId, wsId)));
    try { await logAudit(wsId, ctx.user.id, "delete", "recordNotes", input.id, null); } catch {}
    return { success: true };
  }),
});

export const recordTimelineRouter = router({
  list: protectedProcedure.input(z.object({ recordType: z.string(), recordId: z.number() })).query(async ({ ctx, input }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    return db.select().from(recordTimeline).where(and(eq(recordTimeline.workspaceId, wsId), eq(recordTimeline.targetType, input.recordType), eq(recordTimeline.targetId, input.recordId))).orderBy(desc(recordTimeline.createdAt));
  }),
});

export const helpRouter = router({
  getContent: protectedProcedure.input(z.object({ contextKey: z.string() })).query(async ({ input }) => ({ title: "Help", content: "Help content for: " + input.contextKey, contextKey: input.contextKey })),
  list: protectedProcedure.query(async () => [{ id: 1, title: "Getting Started", contextKey: "getting-started", content: "Welcome to PrimeContractorOS" }]),
});
''')

p = Path('server/batch2Router.ts')
s = p.read_text().replace('// @ts-nocheck\n', '', 1)
s = s.replace('    await enforcePermission(ctx.user.id, "write");\n    const { id, ...data } = input;\n    await db.update(subcontractors).set(data).where(eq(subcontractors.id, id));\n    try { await logAudit(wsId, ctx.user.id, "update", "subcontractors", 0, input); } catch {}', '    const { wsId } = await enforcePermission(ctx.user.id, "write");\n    const { id, ...data } = input;\n    await db.update(subcontractors).set(data).where(and(eq(subcontractors.id, id), eq(subcontractors.workspaceId, wsId)));\n    try { await logAudit(wsId, ctx.user.id, "update", "subcontractors", id, input); } catch {}', 1)
s = s.replace('    await enforcePermission(ctx.user.id, "delete");\n    await db.delete(subcontractors).where(eq(subcontractors.id, input.id));\n    try { await logAudit(wsId, ctx.user.id, "delete", "subcontractors", input.id, null); } catch {}', '    const { wsId } = await enforcePermission(ctx.user.id, "delete");\n    await db.delete(subcontractors).where(and(eq(subcontractors.id, input.id), eq(subcontractors.workspaceId, wsId)));\n    try { await logAudit(wsId, ctx.user.id, "delete", "subcontractors", input.id, null); } catch {}', 1)
s = s.replace('    await enforcePermission(ctx.user.id, "write");\n    const { id, ...data } = input;\n    await db.update(vendors).set(data).where(eq(vendors.id, id));\n    try { await logAudit(wsId, ctx.user.id, "update", "vendors", 0, input); } catch {}', '    const { wsId } = await enforcePermission(ctx.user.id, "write");\n    const { id, ...data } = input;\n    await db.update(vendors).set(data).where(and(eq(vendors.id, id), eq(vendors.workspaceId, wsId)));\n    try { await logAudit(wsId, ctx.user.id, "update", "vendors", id, input); } catch {}', 1)
s = s.replace('    await enforcePermission(ctx.user.id, "delete");\n    await db.delete(vendors).where(eq(vendors.id, input.id));\n    try { await logAudit(wsId, ctx.user.id, "delete", "vendors", input.id, null); } catch {}', '    const { wsId } = await enforcePermission(ctx.user.id, "delete");\n    await db.delete(vendors).where(and(eq(vendors.id, input.id), eq(vendors.workspaceId, wsId)));\n    try { await logAudit(wsId, ctx.user.id, "delete", "vendors", input.id, null); } catch {}', 1)
old='''export const documentVersionsRouter = router({
  list: protectedProcedure.input(z.object({ fileId: z.number() })).query(async ({ ctx, input }) => {
    const db = await getDb();
    return db.select().from(documentVersions).where(eq(documentVersions.fileId, input.fileId)).orderBy(desc(documentVersions.createdAt));
  }),
  create: protectedProcedure.input(z.object({ fileId: z.number(), versionNumber: z.number(), changeDescription: z.string().optional(), fileUrl: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    await enforcePermission(ctx.user.id, "write");
    await db.insert(documentVersions).values({ ...input, createdBy: ctx.user.id });
    try { await logAudit(wsId, ctx.user.id, "create", "documentVersions", 0, input); } catch {}
    return { success: true };
  }),
});'''
new='''export const documentVersionsRouter = router({
  list: protectedProcedure.input(z.object({ fileId: z.number() })).query(async ({ ctx, input }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    return db.select().from(documentVersions).where(and(eq(documentVersions.workspaceId, wsId), eq(documentVersions.documentType, "file"), eq(documentVersions.documentId, input.fileId))).orderBy(desc(documentVersions.createdAt));
  }),
  create: protectedProcedure.input(z.object({ fileId: z.number(), versionNumber: z.number(), changeDescription: z.string().optional(), fileUrl: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    const { wsId } = await enforcePermission(ctx.user.id, "write");
    await db.insert(documentVersions).values({ workspaceId: wsId, documentType: "file", documentId: input.fileId, versionNumber: input.versionNumber, changeNote: input.changeDescription, fileKey: input.fileUrl, changedBy: ctx.user.id });
    try { await logAudit(wsId, ctx.user.id, "create", "documentVersions", 0, input); } catch {}
    return { success: true };
  }),
});'''
if old not in s: raise SystemExit('documentVersions target missing')
s=s.replace(old,new,1)
s=s.replace('    await db.update(changeOrders).set(data).where(eq(changeOrders.id, id));', '    await db.update(changeOrders).set(data).where(and(eq(changeOrders.id, id), eq(changeOrders.workspaceId, wsId)));', 1)
s=s.replace('    await db.delete(changeOrders).where(eq(changeOrders.id, input.id));', '    await db.delete(changeOrders).where(and(eq(changeOrders.id, input.id), eq(changeOrders.workspaceId, wsId)));', 1)
old='''export const fileLinksRouter = router({
  list: protectedProcedure.input(z.object({ recordType: z.string(), recordId: z.number() })).query(async ({ ctx, input }) => {
    const db = await getDb();
    return db.select().from(fileLinks).where(eq(fileLinks.recordType, input.recordType));
  }),
  create: protectedProcedure.input(z.object({ fileId: z.number(), recordType: z.string(), recordId: z.number(), linkType: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    await enforcePermission(ctx.user.id, "write");
    await db.insert(fileLinks).values(input);
    try { await logAudit(wsId, ctx.user.id, "create", "fileLinks", 0, input); } catch {}
    return { success: true };
  }),
});'''
new='''export const fileLinksRouter = router({
  list: protectedProcedure.input(z.object({ recordType: z.string(), recordId: z.number() })).query(async ({ ctx, input }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    return db.select().from(fileLinks).where(and(eq(fileLinks.workspaceId, wsId), eq(fileLinks.targetType, input.recordType), eq(fileLinks.targetId, input.recordId)));
  }),
  create: protectedProcedure.input(z.object({ fileId: z.number(), recordType: z.string(), recordId: z.number(), linkType: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    const { wsId } = await enforcePermission(ctx.user.id, "write");
    await db.insert(fileLinks).values({ workspaceId: wsId, fileId: input.fileId, targetType: input.recordType, targetId: input.recordId, linkType: input.linkType || "related", createdBy: ctx.user.id });
    try { await logAudit(wsId, ctx.user.id, "create", "fileLinks", 0, input); } catch {}
    return { success: true };
  }),
});'''
if old not in s: raise SystemExit('fileLinks target missing')
s=s.replace(old,new,1)
p.write_text(s)

Path('server/phase2LegacyRouterHardening.test.ts').write_text('''import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const b1 = readFileSync(join(here, "batch1Router.ts"), "utf8");
const b2 = readFileSync(join(here, "batch2Router.ts"), "utf8");
describe("phase 2 legacy router hardening", () => {
  it("scopes notes and timeline by workspace", () => { expect(b1).toContain("eq(recordNotes.workspaceId, wsId)"); expect(b1).toContain("eq(recordTimeline.workspaceId, wsId)"); });
  it("maps note API fields to current schema", () => { expect(b1).toContain("targetType: input.recordType"); expect(b1).toContain("noteText: input.content"); expect(b1).toContain("authorId: ctx.user.id"); });
  it("scopes vendor subcontractor and change-order mutations", () => { expect(b2).toContain("eq(subcontractors.workspaceId, wsId)"); expect(b2).toContain("eq(vendors.workspaceId, wsId)"); expect(b2).toContain("eq(changeOrders.workspaceId, wsId)"); });
  it("maps document versions and file links to current schema", () => { expect(b2).toContain('documentType: "file"'); expect(b2).toContain("eq(documentVersions.workspaceId, wsId)"); expect(b2).toContain("targetType: input.recordType"); expect(b2).toContain("eq(fileLinks.workspaceId, wsId)"); });
  it("removes ts-nocheck", () => { expect(b1).not.toContain("@ts-nocheck"); expect(b2).not.toContain("@ts-nocheck"); });
});
''')
