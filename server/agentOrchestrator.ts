import { and, desc, eq } from "drizzle-orm";
import { agentRuns, auditLog } from "../drizzle/schema";
import { getDb, getInsertId } from "./db";

export type AgentType =
  | "intake-classification"
  | "missing-information"
  | "internal-planning"
  | "finance-quote-support"
  | "operations"
  | "compliance-support"
  | "customer-guidance"
  | "critic-verification";

export type AgentExecution = {
  workspaceId: number;
  userId: number;
  intent: string;
  relatedRecordType?: string;
  relatedRecordId?: number;
  priority?: "low" | "medium" | "high" | "critical";
};

const DANGEROUS_INTENTS = /\b(send|email|message|purchase|buy|pay|transfer|delete|remove|cancel|deploy|publish|change password|rotate key|revoke access)\b/i;

export function classifyAgent(intent: string): AgentType {
  const q = intent.toLowerCase();

  if (/invoice|payment|pricing|quote|cash flow|finance|subcontractor payment/.test(q)) {
    return "finance-quote-support";
  }
  if (/contract|clause|far|dfars|compliance|flowdown|subcontract|modification|deliverable|obligation/.test(q)) {
    return "compliance-support";
  }
  if (/opportunity|solicitation|sam\.gov|bid|proposal|capture/.test(q)) {
    return "intake-classification";
  }
  if (/missing|what do i need|incomplete|readiness|setup/.test(q)) {
    return "missing-information";
  }
  if (/plan|planning|roadmap|next step|prioritize/.test(q)) {
    return "internal-planning";
  }
  if (/operate|operations|task|deadline|schedule|work order/.test(q)) {
    return "operations";
  }
  if (/verify|check|critic|audit|validate|double-check/.test(q)) {
    return "critic-verification";
  }
  return "customer-guidance";
}

function systemPrompt(agentType: AgentType): string {
  return [
    "You are a governed PrimeContractorOS internal agent.",
    "You are operating for Reed's Solutions, LLC.",
    "You must not claim legal authority or replace contracting-officer direction, legal counsel, accounting review, or human approval.",
    "Use only the intent and context provided in this run.",
    "Separate verified facts, user-stated information, inference, and missing information.",
    "Do not invent contract terms, regulations, records, or evidence.",
    "Do not perform external actions. Return analysis/guidance only.",
    `Assigned agent: ${agentType}.`,
    "Return a concise operational result with: Summary, Findings, Recommended next step, and Review state.",
  ].join("\n");
}

async function callOllama(agentType: AgentType, intent: string, context?: Record<string, unknown>) {
  const baseUrl = (process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").replace(/\/$/, "");
  const model = process.env.OLLAMA_MODEL || "llama3.2:3b";

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [
        { role: "system", content: systemPrompt(agentType) },
        {
          role: "user",
          content: JSON.stringify({ intent, context: context || {} }),
        },
      ],
      options: { temperature: 0.2 },
    }),
    signal: AbortSignal.timeout(Number(process.env.OLLAMA_TIMEOUT_MS || 45000)),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Ollama request failed: ${response.status} ${body.slice(0, 500)}`);
  }

  const data = await response.json() as {
    model?: string;
    message?: { content?: string };
  };

  const result = data.message?.content?.trim();
  if (!result) throw new Error("Ollama returned no message content.");

  return { model: data.model || model, result };
}

export async function executeAgent(input: AgentExecution) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const agentType = classifyAgent(input.intent);
  const priority = input.priority || "medium";

  const inserted = await db.insert(agentRuns).values({
    workspaceId: input.workspaceId,
    platformOwnerOnly: false,
    relatedRecordType: input.relatedRecordType || null,
    relatedRecordId: input.relatedRecordId || null,
    agentType,
    status: DANGEROUS_INTENTS.test(input.intent) ? "blocked" : "processing",
    priority,
    sourceTrigger: "command_dock",
    createdBy: input.userId,
    intent: input.intent,
  });
  const agentRunId = getInsertId(inserted);

  const auditCreate = await db.insert(auditLog).values({
    workspaceId: input.workspaceId,
    userId: input.userId,
    action: "create",
    entity: "agentRun",
    entityId: agentRunId,
    changes: JSON.stringify({
      phase: "intent->agent",
      agentType,
      sourceTrigger: "command_dock",
      priority,
    }),
  });
  const auditCreateId = getInsertId(auditCreate);

  await db.update(agentRuns)
    .set({ auditLogId: auditCreateId })
    .where(and(eq(agentRuns.id, agentRunId), eq(agentRuns.workspaceId, input.workspaceId)));

  if (DANGEROUS_INTENTS.test(input.intent)) {
    const result = "Blocked: this Command Dock run requested an external, destructive, financial, credential, or production action. PrimeContractorOS requires the appropriate human approval gate before such an action can execute.";
    await db.update(agentRuns)
      .set({ result, errorMessage: "Approval required", updatedAt: new Date() })
      .where(and(eq(agentRuns.id, agentRunId), eq(agentRuns.workspaceId, input.workspaceId)));

    await db.insert(auditLog).values({
      workspaceId: input.workspaceId,
      userId: input.userId,
      action: "update",
      entity: "agentRun",
      entityId: agentRunId,
      changes: JSON.stringify({ phase: "guardrail", status: "blocked", reason: "approval_required" }),
    });

    return { agentRunId, agentType, status: "blocked" as const, modelUsed: null, result, auditLogId: auditCreateId };
  }

  try {
    const ollama = await callOllama(agentType, input.intent, {
      relatedRecordType: input.relatedRecordType,
      relatedRecordId: input.relatedRecordId,
    });

    await db.update(agentRuns)
      .set({
        status: "completed",
        result: ollama.result,
        modelUsed: ollama.model,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(agentRuns.id, agentRunId), eq(agentRuns.workspaceId, input.workspaceId)));

    const auditResult = await db.insert(auditLog).values({
      workspaceId: input.workspaceId,
      userId: input.userId,
      action: "update",
      entity: "agentRun",
      entityId: agentRunId,
      changes: JSON.stringify({
        phase: "ollama->result->audit",
        status: "completed",
        agentType,
        modelUsed: ollama.model,
      }),
    });
    const auditLogId = getInsertId(auditResult);

    return {
      agentRunId,
      agentType,
      status: "completed" as const,
      modelUsed: ollama.model,
      result: ollama.result,
      auditLogId,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    await db.update(agentRuns)
      .set({
        status: "failed",
        errorMessage: message.slice(0, 2000),
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(agentRuns.id, agentRunId), eq(agentRuns.workspaceId, input.workspaceId)));

    const auditResult = await db.insert(auditLog).values({
      workspaceId: input.workspaceId,
      userId: input.userId,
      action: "update",
      entity: "agentRun",
      entityId: agentRunId,
      changes: JSON.stringify({
        phase: "ollama->error->audit",
        status: "failed",
        agentType,
        error: message.slice(0, 500),
      }),
    });

    return {
      agentRunId,
      agentType,
      status: "failed" as const,
      modelUsed: process.env.OLLAMA_MODEL || "llama3.2:3b",
      result: null,
      auditLogId: getInsertId(auditResult),
      error: message,
    };
  }
}

export async function listAgentRuns(workspaceId: number, limit = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select({
    id: agentRuns.id,
    agentType: agentRuns.agentType,
    status: agentRuns.status,
    priority: agentRuns.priority,
    sourceTrigger: agentRuns.sourceTrigger,
    intent: agentRuns.intent,
    result: agentRuns.result,
    modelUsed: agentRuns.modelUsed,
    auditLogId: agentRuns.auditLogId,
    createdAt: agentRuns.createdAt,
    completedAt: agentRuns.completedAt,
  }).from(agentRuns)
    .where(eq(agentRuns.workspaceId, workspaceId))
    .orderBy(desc(agentRuns.createdAt))
    .limit(Math.min(Math.max(limit, 1), 100));
}
