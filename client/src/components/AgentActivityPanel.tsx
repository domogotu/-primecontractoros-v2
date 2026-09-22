import { Loader2, CheckCircle2, XCircle, Clock3, ShieldCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";

type Props = {
  relatedRecordType?: string;
  relatedRecordId?: number;
  compact?: boolean;
};

export default function AgentActivityPanel({ relatedRecordType, relatedRecordId, compact = false }: Props) {
  const runs = trpc.agent.list.useQuery({ relatedRecordType, relatedRecordId, limit: compact ? 5 : 20 });
  const approve = trpc.agent.approveAction.useMutation({ onSuccess: () => runs.refetch() });
  const reject = trpc.agent.rejectAction.useMutation({ onSuccess: () => runs.refetch() });

  return (
    <section className={compact ? "border-t px-4 py-3" : "rounded-lg border p-4"}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold">Agent Activity / Handoff</p>
          <p className="text-xs text-muted-foreground">Review-first. Proposed actions never execute automatically.</p>
        </div>
        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
      </div>

      {runs.isLoading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Loading agent activity…</div>
      ) : runs.data?.length ? (
        <div className="space-y-3">
          {runs.data.map((run) => {
            const action = run.proposedAction as { actionType?: string; title?: string; description?: string } | null;
            return (
              <div key={run.id} className="rounded-md border p-3 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{run.agentType}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{run.intent}</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{run.status}</span>
                </div>

                {run.result && <p className="text-xs whitespace-pre-wrap">{run.result}</p>}

                {action && (
                  <div className="rounded-md bg-muted/50 p-2">
                    <p className="text-xs font-semibold">Proposed action — approval required</p>
                    <p className="text-xs mt-1">{action.title}</p>
                    {action.description && <p className="text-[11px] text-muted-foreground mt-1">{action.description}</p>}
                    {run.approvalStatus === "pending" && (
                      <div className="flex gap-2 mt-2">
                        <button
                          className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] hover:bg-background"
                          onClick={() => approve.mutate({ agentRunId: run.id })}
                          disabled={approve.isPending || reject.isPending}
                        >
                          <CheckCircle2 className="h-3 w-3" /> Approve proposal
                        </button>
                        <button
                          className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] hover:bg-background"
                          onClick={() => reject.mutate({ agentRunId: run.id })}
                          disabled={approve.isPending || reject.isPending}
                        >
                          <XCircle className="h-3 w-3" /> Reject
                        </button>
                      </div>
                    )}
                    {run.approvalStatus === "approved" && <p className="text-[11px] mt-2 text-muted-foreground">Approved for a future execution step. Nothing was executed by this approval.</p>}
                    {run.approvalStatus === "rejected" && <p className="text-[11px] mt-2 text-muted-foreground">Proposal rejected. Nothing was executed.</p>}
                  </div>
                )}

                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" /> Run #{run.id}</span>
                  {run.modelUsed && <span>{run.modelUsed}</span>}
                  {run.relatedRecordType && <span>{run.relatedRecordType}{run.relatedRecordId ? ` #${run.relatedRecordId}` : ""}</span>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No agent runs for this context yet.</p>
      )}
    </section>
  );
}
