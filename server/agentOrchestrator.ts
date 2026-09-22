import { TRPCError } from "@trpc/server";
import { and, eq, desc } from "drizzle-orm";
import { getDb } from "./db";
import { logAudit } from "./featureRouter";
import { agentRuns, opportunities, proposals, contracts, files as filesTable, invoices } from "../drizzle/schema";

export const AGENT_TYPES = [
  "intake-classification",
  "missing-information",
  "internal-planning",
  "finance-quote-support",
  "operations",
  "compliance-support",
  "customer-guidance",
  "critic-verification",
] as const;

export type AgentType = typeof AGENT_TYPES[number];

export type ProposedAction = {
  actionType: string;
  title: string;
  description: string;
  parameters?: Record<string, unknown>;
  requiresApproval: true;
};

function parseModelOutput(raw: string): { displayResult: string; proposedAction: ProposedAction | null } {
  const cleaned = raw.trim().replace(/^\`\`\`json\s*/i, "").replace(/^\`\`\`\s*/i, "").replace(/\s*\`\`\`$/i, "");
  try {
    const parsed = JSON.parse(cleaned);
    const proposedAction = parsed.proposedAction && typeof parsed.proposedAction === "object"
      ? {
          actionType: String(parsed.proposedAction.actionType || "review"),
          title: String(parsed.proposedAction.title || "Review proposed action"),
          description: String(parsed.proposedAction.description || ""),
          parameters: parsed.proposedAction.parameters && typeof parsed.proposedAction.parameters === "object" ? parsed.proposedAction.parameters : undefined,
          requiresApproval: true as const,
        }
      : null;
    const displayResult = typeof parsed.result === "string"
      ? parsed.result
      : typeof parsed.summary === "string"
        ? parsed.summary
        : raw;
    return { displayResult, proposedAction };
  } catch {
    return { displayResult: raw, proposedAction: null };
  }
}

export function classifyAgent(intent: string): AgentType {
  const q = intent.toLowerCase();
  if (/invoice|payment|pricing|quote|cash flow|cashflow|subcontractor payment/.test(q)) return "finance-quote-support";
  if (/contract|clause|far|dfars|compliance|flowdown|subcontract|modification|deliverable|obligation/.test(q)) return "compliance-support";
  if (/opportunity|solicitation|sam\.gov|bid|proposal|capture/.test(q)) return "intake-classification";
  if (/missing|what do i need|incomplete|readiness|setup/.test(q)) return "missing-information";
  if (/plan|planning|roadmap|next step|prioritize/.test(q)) return "internal-planning";
  if (/operate|operations|task|deadline|schedule|work order/.test(q)) return "operations";
  if (/verify|check|critic|audit|validate|double-check/.test(q)) return "critic-verification";
  return "customer-guidance";
}

const BLOCKED_INTENT = /\b(send|email|message|purchase|buy|pay|transfer|delete|remove|cancel|deploy|publish|change password|rotate key|revoke access)\b/i;

async function loadRecordContext(workspaceId: number, type?: string, id?: number) {
  if (!type || !id) return null;
  const db = await getDb();
  if (!db) return null;
  const normalized = type.toLowerCase().replace(/s$/, "");
  if (normalized === "opportunit" || normalized === "opportunity") {
    const [row] = await db.select().from(opportunities).where(and(eq(opportunities.id, id), eq(opportunities.workspaceId, workspaceId))).limit(1);
    return row ? { recordType: "opportunity", recordId: id, data: row } : null;
  }
  if (normalized === "proposal") {
    const [row] = await db.select().from(proposals).where(and(eq(proposals.id, id), eq(proposals.workspaceId, workspaceId))).limit(1);
    return row ? { recordType: "proposal", recordId: id, data: row } : null;
  }
  if (normalized === "contract") {
    const [row] = await db.select().from(contracts).where(and(eq(contracts.id, id), eq(contracts.workspaceId, workspaceId))).limit(1);
    return row ? { recordType: "contract", recordId: id, data: row } : null;
  }
  if (normalized === "file") {
    const [row] = await db.select().from(filesTable).where(and(eq(filesTable.id, id), eq(filesTable.workspaceId, workspaceId))).limit(1);
    return row ? { recordType: "file", recordId: id, data: row } : null;
  }
  if (normalized === "invoice") {
    const [row] = await db.select().from(invoices).where(and(eq(invoices.id, id), eq(invoices.workspaceId, workspaceId))).limit(1);
    return row ? { recordType: "invoice", recordId: id, data: row } : null;
  }
  return { recordType: type, recordId: id, data: null, note: "Record type is not yet context-adapted; do not invent record facts." };
}

export async function executeAgent(args: {
  userId: number;
  workspaceId: number;
  intent: string;
  relatedRecordType?: string;
  relatedRecordId?: number;
  priority?: "low" | "medium" | "high" | "critical";
}) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const agentType = classifyAgent(args.intent);
  const context = await loadRecordContext(args.workspaceId, args.relatedRecordType, args.relatedRecordId);
  const [run] = await db.insert(agentRuns).values({
    workspaceId: args.workspaceId,
    platformOwnerOnly: false,
    relatedRecordType: args.relatedRecordType,
    relatedRecordId: args.relatedRecordId,
    agentType,
    status: "processing",
    priority: args.priority || "medium",
    sourceTrigger: "command_dock",
    createdBy: args.userId,
    intent: args.intent,
    recordContext: context ? JSON.stringify(context) : null,
  }).$returningId();
  const agentRunId = run.id;

  await logAudit(args.workspaceId, args.userId, "create", "agentRun", agentRunId, {
    agentType, intent: args.intent, relatedRecordType: args.relatedRecordType, relatedRecordId: args.relatedRecordId,
  });

  if (BLOCKED_INTENT.test(args.intent)) {
    const message = "This intent is outside the automatic analysis lane. No external, financial, destructive, credential, or production action was executed.";
    await db.update(agentRuns).set({ status: "blocked", result: message, approvalStatus: "not_required", completedAt: new Date() })
      .where(and(eq(agentRuns.id, agentRunId), eq(agentRuns.workspaceId, args.workspaceId)));
    await logAudit(args.workspaceId, args.userId, "update", "agentRun", agentRunId, { status: "blocked", reason: "guardrail" });
    return { agentRunId, agentType, status: "blocked", result: message, modelUsed: null, auditLogId: null, proposedAction: null };
  }

  const systemPrompt = [
    "You are a governed internal PrimeContractorOS agent for Reed’s Solutions, LLC.",
    "You provide analysis and guidance only. You are not legal authority and do not replace a contracting officer, lawyer, accountant, or required human review.",
    "Separate verified record facts, user-stated information, inference, and missing information. Never invent contract terms, regulations, records, dates, evidence, or source text.",
    "The awarded contract and approved source-linked findings remain governing sources; AI output is review-first.",
    "You may propose a structured next action, but it must NEVER be executed automatically.",
    "Return JSON only with: result (string), proposedAction (object|null). If proposing an action, use actionType, title, description, parameters and requiresApproval=true.",
  ].join("\n");

  const userPrompt = JSON.stringify({
    intent: args.intent,
    agentType,
    recordContext: context,
    instruction: "Analyze the intent in the supplied record context. If a useful next step can be proposed, describe it as an approval-required action. Do not perform it.",
  });

  const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434";
  const model = process.env.OLLAMA_MODEL ?? "llama3.2:3b";
  const timeoutMs = Number(process.env.OLLAMA_TIMEOUT_MS ?? 45000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(baseUrl.replace(/\/$/, "") + "/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model,
        stream: false,
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        options: { temperature: 0.2 },
      }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("Ollama returned HTTP " + response.status);
    const payload = await response.json() as { message?: { content?: string } };
    const raw = payload.message?.content?.trim();
    if (!raw) throw new Error("Ollama returned no message content");
    const parsed = parseModelOutput(raw);
    await db.update(agentRuns).set({
      status: "completed",
      result: parsed.displayResult,
      modelUsed: model,
      proposedAction: parsed.proposedAction ? JSON.stringify(parsed.proposedAction) : null,
      approvalStatus: parsed.proposedAction ? "pending" : "not_required",
      completedAt: new Date(),
    }).where(and(eq(agentRuns.id, agentRunId), eq(agentRuns.workspaceId, args.workspaceId)));
    await logAudit(args.workspaceId, args.userId, "update", "agentRun", agentRunId, {
      status: "completed", modelUsed: model, proposedAction: parsed.proposedAction,
    });
    return { agentRunId, agentType, status: "completed", result: parsed.displayResult, modelUsed: model, auditLogId: null, proposedAction: parsed.proposedAction };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Agent execution failed";
    await db.update(agentRuns).set({ status: "failed", errorMessage: message, completedAt: new Date() })
      .where(and(eq(agentRuns.id, agentRunId), eq(agentRuns.workspaceId, args.workspaceId)));
    await logAudit(args.workspaceId, args.userId, "update", "agentRun", agentRunId, { status: "failed", error: message });
    return { agentRunId, agentType, status: "failed", result: null, modelUsed: model, auditLogId: null, proposedAction: null, error: message };
  } finally {
    clearTimeout(timer);
  }
}

export async function getAgentRun(workspaceId: number, id: number) {
  const db = await getDb();
  if (!db) return null;
  const [run] = await db.select().from(agentRuns).where(and(eq(agentRuns.id, id), eq(agentRuns.workspaceId, workspaceId))).limit(1);
  if (!run) return null;
  return { ...run, proposedAction: run.proposedAction ? JSON.parse(run.proposedAction) : null };
}

export async function listAgentRuns(workspaceId: number, relatedRecordType?: string, relatedRecordId?: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(agentRuns)
    .where(eq(agentRuns.workspaceId, workspaceId))
    .orderBy(desc(agentRuns.createdAt))
    .limit(limit);
  return rows
    .filter(row => !relatedRecordType || row.relatedRecordType === relatedRecordType)
    .filter(row => relatedRecordId === undefined || row.relatedRecordId === relatedRecordId)
    .map(row => ({ ...row, proposedAction: row.proposedAction ? JSON.parse(row.proposedAction) : null }));
}
