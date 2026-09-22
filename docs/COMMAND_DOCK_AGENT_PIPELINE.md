# Command Dock → Intent → Agent → Ollama → Result → Audit → UI

## Purpose

This is the first vertical slice of the PrimeContractorOS governed agent pipeline.

Flow:

`Command Dock -> intent -> agent routing -> Ollama -> result persistence -> audit event -> UI result`

## Runtime

- Client entry: `client/src/components/CommandPalette.tsx`
- tRPC entry: `server/agentRouter.ts`
- Agent routing/orchestration: `server/agentOrchestrator.ts`
- Durable execution record: `drizzle/schema.ts` / `agent_runs`
- Migration: `drizzle/0023_command_dock_agents.sql`
- Existing audit system: `auditLog`

## Agent routing

The first router is deterministic and intentionally small:

- Finance, invoices, payments, pricing, quote, cash flow -> `finance-quote-support`
- Contract, FAR/DFARS, compliance, flowdown, subcontracting, modifications, obligations -> `compliance-support`
- Opportunity, solicitation, SAM.gov, bid, proposal, capture -> `intake-classification`
- Missing/setup/readiness -> `missing-information`
- Planning/roadmap/next step -> `internal-planning`
- Operations/tasks/deadlines/scheduling -> `operations`
- Verify/audit/validate/critic -> `critic-verification`
- Other general guidance -> `customer-guidance`

## Ollama configuration

Set server-side environment variables:

- `OLLAMA_BASE_URL` — default `http://127.0.0.1:11434`
- `OLLAMA_MODEL` — default `llama3.2:3b`
- `OLLAMA_TIMEOUT_MS` — default `45000`

The server calls Ollama's `/api/chat` endpoint with streaming disabled.

## Guardrail

The first vertical slice is analysis/guidance only. Requests containing external communication, spending/payment, destructive actions, credential changes, or production changes are blocked and audited instead of being sent to Ollama.

AI output is not governing contract truth. The existing PrimeContractorOS review-first model remains in force.

## UI behavior

The existing Cmd/Ctrl+K Command Palette now includes an agent intent lane. Entering an intent and selecting **Run**:

1. creates an `agent_runs` record;
2. records the initial audit event;
3. routes the intent to a specialist agent;
4. calls Ollama;
5. stores the result/status/model;
6. records a completion/failure/guardrail audit event;
7. displays the agent, status, model, result, run ID, and audit ID in the Command Dock.

## Current limitation

The code is wired for local Ollama, but actual execution requires a running Ollama service with the configured model available on the server host. No model is bundled with PrimeContractorOS.


## Next layer: record context + Agent Activity/Handoff

Agent runs now carry the workspace-scoped record context used to answer an intent. Supported context loaders currently include opportunity, proposal, contract, file, and invoice records. Unknown record types are explicitly marked as context-unadapted rather than filled with invented facts.

The Command Dock derives the current `/app/<recordType>/<id>` context when available and passes it into the agent run. The Agent Activity/Handoff panel can filter activity to that same record.

## Approved-action gate

A model may return a structured `proposedAction` with:
- actionType
- title
- description
- parameters
- requiresApproval=true

The proposal is stored with `approvalStatus=pending`. Users can approve or reject the proposal from Agent Activity/Handoff.

**Approval does not execute the action.** The approval endpoint only records the human decision and audit event. A later implementation must provide a separate, explicit execution path with its own authorization, validation, and audit controls.

This preserves the review-first architecture:
`intent -> context -> agent -> Ollama -> result -> proposed action -> human approval -> separate execution`.


## Full execution lifecycle

The governed action lifecycle is now modeled as:

**Agent proposes → Human approves → Execution preview → Explicit execution authorization → Execute → Verify result → Audit**

State transitions:
- `not_required` / `pending` → proposal decision
- `approved` → `preview_ready`
- `preview_ready` → `authorized`
- `authorized` → execution attempt
- execution attempt → `verified` or `failed`

The execution endpoint will not perform an action unless a registered execution adapter exists for the proposed action type. Approval and authorization alone never execute an external action.

Current adapter status: **not registered**. This is intentional until each domain mutation has its own authorization, validation, idempotency, rollback/error handling, and audit implementation.

## Windows development launcher

The development command now uses `scripts/dev.mjs` rather than embedding Unix-style `NODE_ENV=development` syntax in `package.json`. The launcher sets the environment inside Node and starts `tsx` with `windowsHide: true` on Windows, reducing terminal-window flashing caused by shell-based startup.
