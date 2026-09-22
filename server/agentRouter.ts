import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { requireWorkspaceId } from "./workspaceMiddleware";
import { getDb } from "./db";
import { agentRuns } from "../drizzle/schema";
import { executeAgent, getAgentRun, listAgentRuns } from "./agentOrchestrator";
import { logAudit } from "./featureRouter";

export const agentRouter = router({
  execute: protectedProcedure.input(z.object({
    intent: z.string().min(3),
    relatedRecordType: z.string().max(64).optional(),
    relatedRecordId: z.number().int().positive().optional(),
    priority: z.enum(["low","medium","high","critical"]).optional(),
  })).mutation(async ({ ctx, input }) => {
    const workspaceId = await requireWorkspaceId(ctx.user.id);
    return executeAgent({ userId: ctx.user.id, workspaceId, ...input });
  }),

  list: protectedProcedure.input(z.object({
    relatedRecordType: z.string().optional(),
    relatedRecordId: z.number().optional(),
    limit: z.number().min(1).max(100).default(20),
  }).optional()).query(async ({ ctx, input }) => {
    const workspaceId = await requireWorkspaceId(ctx.user.id);
    return listAgentRuns(workspaceId, input?.relatedRecordType, input?.relatedRecordId, input?.limit ?? 20);
  }),

  get: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const workspaceId = await requireWorkspaceId(ctx.user.id);
    const run = await getAgentRun(workspaceId, input.id);
    if (!run) throw new TRPCError({ code: "NOT_FOUND", message: "Agent run not found" });
    return run;
  }),

  approveAction: protectedProcedure.input(z.object({
    agentRunId: z.number().int().positive(),
    notes: z.string().max(2000).optional(),
  })).mutation(async ({ ctx, input }) => {
    const workspaceId = await requireWorkspaceId(ctx.user.id);
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    const [run] = await db.select().from(agentRuns).where(and(eq(agentRuns.id, input.agentRunId), eq(agentRuns.workspaceId, workspaceId))).limit(1);
    if (!run) throw new TRPCError({ code: "NOT_FOUND", message: "Agent run not found" });
    if (run.approvalStatus !== "pending" || !run.proposedAction) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "No pending proposed action exists for this run." });
    }
    await db.update(agentRuns).set({
      approvalStatus: "approved",
      approvedBy: ctx.user.id,
      approvedAt: new Date(),
      approvalNotes: input.notes ?? null,
    }).where(and(eq(agentRuns.id, input.agentRunId), eq(agentRuns.workspaceId, workspaceId)));
    await logAudit(workspaceId, ctx.user.id, "update", "agentRun", input.agentRunId, {
      approvalStatus: "approved", approvedBy: ctx.user.id, notes: input.notes ?? null,
      execution: "NOT_EXECUTED",
    });
    return { success: true, executionStarted: false, status: "approved" as const };
  }),

  rejectAction: protectedProcedure.input(z.object({
    agentRunId: z.number().int().positive(),
    notes: z.string().max(2000).optional(),
  })).mutation(async ({ ctx, input }) => {
    const workspaceId = await requireWorkspaceId(ctx.user.id);
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    const [run] = await db.select().from(agentRuns).where(and(eq(agentRuns.id, input.agentRunId), eq(agentRuns.workspaceId, workspaceId))).limit(1);
    if (!run) throw new TRPCError({ code: "NOT_FOUND", message: "Agent run not found" });
    if (run.approvalStatus !== "pending" || !run.proposedAction) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "No pending proposed action exists for this run." });
    }
    await db.update(agentRuns).set({
      approvalStatus: "rejected",
      approvedBy: ctx.user.id,
      approvedAt: new Date(),
      approvalNotes: input.notes ?? null,
    }).where(and(eq(agentRuns.id, input.agentRunId), eq(agentRuns.workspaceId, workspaceId)));
    await logAudit(workspaceId, ctx.user.id, "update", "agentRun", input.agentRunId, {
      approvalStatus: "rejected", approvedBy: ctx.user.id, notes: input.notes ?? null,
      execution: "NOT_EXECUTED",
    });
    return { success: true, executionStarted: false, status: "rejected" as const };
  }),
});
