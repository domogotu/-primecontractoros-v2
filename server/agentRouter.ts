import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { requireWorkspaceId } from "./workspaceMiddleware";
import { executeAgent, listAgentRuns } from "./agentOrchestrator";

export const agentRouter = router({
  execute: protectedProcedure
    .input(z.object({
      intent: z.string().trim().min(3).max(4000),
      relatedRecordType: z.string().trim().max(64).optional(),
      relatedRecordId: z.number().int().positive().optional(),
      priority: z.enum(["low", "medium", "high", "critical"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      return executeAgent({
        workspaceId,
        userId: ctx.user.id,
        intent: input.intent,
        relatedRecordType: input.relatedRecordType,
        relatedRecordId: input.relatedRecordId,
        priority: input.priority,
      });
    }),

  list: protectedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(100).optional() }).optional())
    .query(async ({ input, ctx }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      return listAgentRuns(workspaceId, input?.limit);
    }),
});
