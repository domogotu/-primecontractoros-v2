# CRITICAL REPOSITORY WORKSTREAM BOUNDARY

**READ THIS SECTION FIRST. IT GOVERNS EVERYTHING BELOW IT.**

This repository contains **TWO SEPARATE PROJECT WORKSTREAMS**. They must never be merged, confused, cross-applied, or treated as one project.

## WORKSTREAM A — PrimeContractorOS

PrimeContractorOS source and modernization work applies **only** to the existing application areas:

- `client/`
- `server/`
- `drizzle/`
- `docs/`
- existing PrimeContractorOS configuration and application files
- `MIGRATION_REGISTER.md`

The PrimeContractorOS migration, modernization, release, testing, and technical-debt instructions elsewhere in this CLAUDE.md apply **ONLY** to PrimeContractorOS. They **DO NOT** apply to `unified-ai-ecosystem/`.

- Do not move Unified AI Ecosystem files into PrimeContractorOS folders.
- Do not modify PrimeContractorOS architecture merely to accommodate the Unified AI Ecosystem.
- Do not interpret Unified AI Ecosystem specifications as PrimeContractorOS requirements.

## WORKSTREAM B — Unified AI Ecosystem

The Unified AI Ecosystem is a completely separate project contained under:

```
unified-ai-ecosystem/
```

Its authoritative specification is:

- `unified-ai-ecosystem/spec/00-intake-instructions.md`
- `unified-ai-ecosystem/spec/01-foundation-architecture.md`
- `unified-ai-ecosystem/spec/02-llm-agent-frameworks.md`
- `unified-ai-ecosystem/spec/03-rag-embeddings-mcp-vector-databases.md`
- `unified-ai-ecosystem/spec/04-memory-security-observability.md`
- `unified-ai-ecosystem/spec/05-automation-documents-realtime-tools.md`
- `unified-ai-ecosystem/spec/06-orchestration-admin-recovery.md`
- `unified-ai-ecosystem/spec/07-build-order-testing-acceptance.md`
- `unified-ai-ecosystem/spec/08-realtime-qa-final-build.md`

Also read:

- `unified-ai-ecosystem/BUILD_STATUS.md`
- `unified-ai-ecosystem/COMPONENT_INVENTORY.md`
- `unified-ai-ecosystem/prompts/CONTINUATION_FROM_PHASE_4.md`

For Unified AI Ecosystem work, these files override unrelated PrimeContractorOS implementation instructions.

## CURRENT UNIFIED AI ECOSYSTEM BUILD STATE

The n8n AI Builder is **currently paused**.

The project continuation point is: **PHASE 4**

Phases 1 through 3 must be treated as **preserved prior work**.

- Do not restart them.
- Do not redesign them.
- Do not recreate them merely because their implementation is incomplete in this Git repository.

Before modifying Phase 1–3 artifacts, first establish that an actual defect, missing dependency, incompatibility, or specification violation requires a targeted repair.

Continue implementation from Phase 4.

**Remaining phase sequence** (per `BUILD_STATUS.md`):

- Phase 4 — Knowledge layer: RAG, embeddings, vector databases
- Phase 5 — Memory
- Phase 6 — MCP
- Phase 7 — Security
- Phase 8 — Observability
- Phase 9 — Automation
- Phase 10 — Document pipeline
- Phase 11 — Tool gateway
- Phase 12 — Master orchestrator
- Final — Unified AI Ecosystem — Real-Time Q&A Starter

## BUILD POLICY — ARCHITECTURE FIRST

For Unified AI Ecosystem work:

**BUILD THE COMPLETE ARCHITECTURE FIRST. Credentials and live external configuration come afterward.**

When a component requires API keys, OAuth, credentials, hosted services, external deployments, database instances, MCP servers, model endpoints, cloud accounts, or third-party configuration — do not stop implementation merely because those dependencies are unavailable.

Instead:

1. Build the adapter.
2. Build the request/response contracts.
3. Build configuration support.
4. Build environment-variable templates.
5. Build health checks.
6. Build provider tests.
7. Build retry and error handling.
8. Build readiness reporting.
9. Mark the integration clearly as unconfigured.
10. Continue building the remaining architecture.

**Never fabricate a successful connection. Never create fake credentials. Never create fake API responses. Never label an unconfigured integration operational.**

## N8N WORKFLOW DEVELOPMENT

Claude Code may create n8n-importable workflow JSON and supporting source files for the Unified AI Ecosystem.

Store generated workflow artifacts under `unified-ai-ecosystem/`, using organized directories for:

- `workflows/`
- `schemas/`
- `adapters/`
- `config/`
- `services/`
- `tests/`
- `docs/`
- `manifests/`

Do not place these generated ecosystem artifacts into PrimeContractorOS application directories.

## TESTING BOUNDARY

Testing must be scoped to the workstream being modified.

For Unified AI Ecosystem work:

- Run ecosystem-specific tests when available.
- Validate JSON schemas.
- Validate generated n8n workflow JSON.
- Test adapters with mocks where live credentials are unavailable.
- Test routing logic.
- Test normalization.
- Test failure handling.
- Test configuration validation.
- Test provider readiness logic.

**Do not report PrimeContractorOS repository-wide build failures as failures of the Unified AI Ecosystem.**

The current repository does **not** contain a complete runnable PrimeContractorOS mirror. As of the last check it contains only three PrimeContractorOS source files (`drizzle/schema.ts`, `server/platformAdminRouter.ts`, `client/src/pages/PlatformOnboarding.tsx`) plus documentation — their dependencies are not present, so commands such as `pnpm test` and `tsc` may therefore fail for reasons entirely unrelated to Unified AI Ecosystem work.

When that occurs, state:

> "Repository-wide PrimeContractorOS validation is unavailable/incomplete and is not being used as the acceptance test for this Unified AI Ecosystem batch."

Do not modify unrelated PrimeContractorOS code merely to make ecosystem testing pass.

## CHANGE SCOPE RULE

Before making changes, identify the active workstream.

If the user requests **Unified AI Ecosystem** work, ONLY modify `unified-ai-ecosystem/` unless a repository-level file must genuinely be changed.

If the user requests **PrimeContractorOS** work, do not modify `unified-ai-ecosystem/` unless explicitly requested.

If a requested change could affect both systems, **stop and explain the cross-project impact before modifying either.**

## SOURCE OF TRUTH

For Unified AI Ecosystem: the specification files under `unified-ai-ecosystem/spec/` are the source of truth.

The repository is the persistent implementation record. n8n is an execution/deployment target, not the sole source of truth. Claude Code should preserve implementation progress in Git so work can continue even when the n8n AI Builder is unavailable.

## CONTINUATION RULE

For Unified AI Ecosystem work:

1. Inspect current repository state.
2. Read `BUILD_STATUS.md`.
3. Determine what Phase 4 work already exists.
4. Preserve completed work.
5. Implement only missing Phase 4 requirements.
6. Continue into later phases in specification order.
7. Commit coherent batches.
8. Update `BUILD_STATUS.md` after meaningful batches.
9. Record built versus unconfigured integrations.
10. Do not pause merely to request credentials.

---
---

# EVERYTHING BELOW THIS LINE APPLIES TO WORKSTREAM A (PrimeContractorOS) ONLY

---

# PrimeContractorOS — Claude Code Project Context (Authoritative — v2)

> This is the **authoritative** version of CLAUDE.md. Development happens here in `-primecontractoros-v2`. When v2 is promoted to production, this file becomes the new production CLAUDE.md. See `docs/MASTER_SPECIFICATION.md` for the full engineering specification this file assumes.

**If you are uncertain whether a change preserves existing functionality, stop, explain the uncertainty, and ask before proceeding. Do not guess.**

You are the lead implementation engineer for the PrimeContractorOS modernization project.

This is **NOT** a rewrite. This is **NOT** a new project. This is a controlled modernization of an existing enterprise SaaS application.

## Project Overview

PrimeContractorOS is a SaaS platform owned by Reed's Solutions LLC — an Enterprise Government Contract Intelligence Platform supporting the complete U.S. government contracting lifecycle for prime contractors and subcontractors, including:

- Opportunity discovery
- Opportunity analysis
- Proposal management
- Contract management
- Active contract operations
- Compliance
- AI-assisted analysis
- Finance
- Closeout
- Organizational learning
- Platform administration

This is an enterprise system. Always favor maintainability, correctness, and production readiness.

## Repository Roles

### Production Repository (Protected) — `domogotu/primecontractoros`

Purpose:
- Stable production baseline
- Recovery point
- Reference implementation

Do not perform large architectural changes here. Emergency fixes only.

### Development Repository — `domogotu/-primecontractoros-v2` (this repo)

This repository is the active development environment. All modernization work happens here. All new architecture is implemented here. All testing happens here. Nothing is promoted to production until it has been verified.

## Primary Objective

The first objective is **NOT** adding features. The first objective is to create a fully working development copy of the production system.

The end result of Phase 1:

Production Repository → PrimeContractorOS v2 → Behavior identical → Verified → Ready for modernization

## Migration Rules

- DO NOT rewrite the project.
- DO NOT redesign the UI without justification.
- DO NOT remove working functionality.
- DO preserve existing behavior unless a documented improvement is required.
- Every change must improve maintainability, correctness, performance, or functionality.

## File-by-File Modernization Workflow

For every source file, follow all steps in order. Never skip a step.

**Step 1 — Read.** Read the entire file. Understand its purpose. Understand its dependencies.

**Step 2 — Assess.** Determine: What does this file do? Is it production-ready? Is it incomplete? Is it duplicated? Is it obsolete?

**Step 3 — Classify.** Compare the implementation against the PrimeContractorOS architecture. Classify the file as Keep / Improve / Refactor / Replace / Remove. Document the reasoning.

**Step 4 — Design.** Design the improved implementation. Preserve existing functionality. Improve architecture. Support future expansion, AI integration, Carry Forward, Knowledge Graph, audit history, and workspace isolation.

**Step 5 — Validate before coding.** Ensure existing functionality remains, and that database, API, and UI impacts are understood.

**Step 6 — Generate.** Generate the improved implementation. Production quality only. No placeholders. No TODOs. No fake data.

**Step 7 — Review.** Check TypeScript, imports, accessibility, security, performance, error handling, and logging.

**Step 8 — Compare to production.** Verify no regressions, no missing functionality, and that changes are intentional improvements only.

**Step 9 — Write to v2.** Write the improved version into `domogotu/-primecontractoros-v2`. Do NOT modify production.

**Step 10 — Verify integration.** Ensure the updated implementation works with routing, components, APIs, authentication, database, AI, and workspace isolation.

**Step 11 — Commit.** Use descriptive, conventional commit messages, e.g.:

```
feat(opportunities): implement AI readiness analysis
fix(auth): resolve workspace isolation bug
refactor(contract): normalize requirement lifecycle
```

**Step 12 — Update the Migration Register.** For every migrated file, record: original path, new path, status, classification, dependencies, verification status, and commit hash.

## Development Philosophy

- Preserve working functionality.
- Improve architecture.
- Reduce technical debt.
- Never sacrifice correctness for speed.
- Always produce production-ready code.
- Do not redesign the application unless there is a documented architectural reason.
- Replace only when necessary.
- Every change must improve the system.

## AI Philosophy

- AI is infrastructure.
- Users should not need to manually activate AI.
- AI should continuously: analyze, organize, compare, recommend, extract, monitor, prepare, summarize, classify, and build organizational knowledge.
- AI is review-first. Humans approve critical actions.

## Government Contracting Workflow

Website → Account Creation → Workspace → Business Profile → Opportunity → Proposal → Submission → Awaiting Award → Award → Contract → Operations → Finance → Closeout → Lessons Learned → Knowledge Graph → Carry Forward

No workflow should require unnecessary re-entry of information.

## Major Platform Systems

**Customer Workspace:** Dashboard, Business Profile, Users, Settings, Tasks, Alerts, Files, Contacts, Messages, Opportunities, Proposals, Contracts, Finance, Reports, Capability Statements, Templates, Closeout, Lessons Learned

**Platform Administration:** Customers, Workspaces, Plans, Billing, Discounts, Revenue, Support, Monitoring, Ownership Recovery, Platform Tasks

## AI Systems

Implement and strengthen: AI Orchestrator, Knowledge Graph, Carry Forward Engine, Organizational Memory, Opportunity Intelligence, Proposal Intelligence, Contract Intelligence, Finance Intelligence, Vendor Intelligence, Compliance Intelligence. Full spec for the two currently-implemented AI types (Guidance AI and Source-Linked Analysis AI) is in `docs/MASTER_SPECIFICATION.md` §8.

## Quality Standards

Every change must:

- build successfully
- pass TypeScript
- pass linting
- preserve existing functionality
- include error handling
- include logging where appropriate
- support workspace isolation
- support audit history
- support future expansion

## Documentation Requirements

Keep documentation synchronized with the implementation. Documentation is part of the implementation, not an afterthought. This repo's docs, by purpose:

- `README.md` — what the project is, for a new developer
- `CLAUDE.md` (this file) — how Claude Code works on it
- `docs/MASTER_SPECIFICATION.md` — full engineering specification
- Create or update as needed: `ARCHITECTURE.md`, `DATABASE.md`, `API.md`, `AI.md`, `WORKFLOWS.md`, `DEVELOPMENT_STANDARDS.md`, `PLATFORM_ADMIN.md`

## Government Contracting Requirements

PrimeContractorOS must understand: FAR, DFARS, NAICS, PSC, UEI, CAGE, SAM registration, set-asides, clauses, deliverables, modifications, compliance, proper invoicing, and closeout. Full reference tables in `docs/MASTER_SPECIFICATION.md` §17.

AI should extract and organize these items from source documents while maintaining links back to the original source.

## Non-Negotiable Rules

- Never create placeholder pages.
- Never leave dead navigation.
- Never remove functionality without replacement.
- Never duplicate logic unnecessarily.
- Never invent business rules.
- Always preserve data integrity.
- Always preserve workspace isolation.
- Always maintain production quality.
- Never hardcode a secret, API key, or connection string as a fallback in source — environment variables only, no exceptions. (This rule exists because it has already been violated twice in production — see Known Technical Debt.)

## Known Technical Debt

*Code-verified findings, current as of the last full audit pass. This section is about what actually needs fixing in the code — for forward-looking features not yet built, see `docs/MASTER_SPECIFICATION.md` §20 Future Roadmap.*

### Security (highest priority)
- **Resend API key hardcoded fallback, twice leaked and auto-revoked** (Jul 20 and Aug 5, 2026) via `server/services/email.ts`, historically at commit `749b13fa7ff4126a91581fd0b5e4e8fc6e9d4953`. As of the last direct check, current `main` reads `server/_core/env.ts` → `ENV.resendApiKey` → `process.env.RESEND_API_KEY` with no fallback, and `server/services/email.ts` reads only `ENV.resendApiKey` — both clean. **Verify this is still true before every deploy**, and confirm the git history purge/BFG-clean has happened if the leaked key value must be fully scrubbed from history.
- A **MySQL `DATABASE_URL`** was also flagged exposed on GitHub (Jul 20, 2026). Rotation status unconfirmed — verify directly with whatever currently hosts the database (Manus TiDB / PlanetScale / Railway per the Render deployment guide).
- `proposalFrameworksRouter.list` and `.get` were found using `publicProcedure` instead of `protectedProcedure` in `server/entityRouters.ts`, exposing proposal frameworks without authentication. A remediation report claims this was fixed — confirm against current source.

### Fake/placeholder data still present (as of last sweep)
- `PlatformOnboarding.tsx` contains a hardcoded array of fake names (e.g., "Sarah Johnson", "Mike Chen") — needs a real tRPC query. **(Addressed in v2: replaced with `trpc.platformAdmin.onboarding.list` backed by the new `admin_invites` table. Verify before treating as closed in production.)**
- `DemoMode.tsx` explicitly generates sample/fake data — by design, but verify it's not reachable from customer-facing navigation (a prior remediation pass removed it from the sidebar; confirm still true).
- `ComponentShowcase.tsx` contains hardcoded AI demo responses and isn't wired to a real route — low priority, but should be excluded from any "real data sweep" false positives.

### "Coming soon" / incomplete UI
- `AIWorkflowButtons.tsx` previously had `compare_versions`, `create_tasks`, and `mark_governing` actions trigger `toast.info("Feature coming soon")`. A remediation report claims these were replaced with real `contractScan`/`fileAnalysis` mutations — confirm against current source before assuming this is resolved.

### Placeholder/stub pages needing full build-out (<50 lines each at last audit)
CustomerAdoption, Diagnostics, ChangeManagement, DemoMode, Handbook, LegalPages, PlanFeatures, Clients, Users, DocumentVersions, EmailTemplates, ConsistencyCheck, ExternalViewer, ContactDetail, PaymentDetail, MessageDetail, FileDetail, InvoiceDetail, AIRuns, AISuggestions, AuditLog, NotificationsCenter. Detail pages in particular (ContactDetail, PaymentDetail, MessageDetail, FileDetail, InvoiceDetail) need full views with linked records, not just a stub.

### Sidebar/navigation gaps (at last audit)
Contract Hub, AI Contract Review/Confirmation, Compliance Matrix, Requirements (no page existed), Closeout, Lessons Learned, Reports, Alerts & Tasks, FAR/DFARS Reference (no page existed) — routes existed for some of these but sidebar entries were missing.

### Dead links / broken handlers (at last audit)
- `TopNavigation.tsx:40` — links to `/app/help`, which doesn't exist; should be `/help`.
- `TopNavigation.tsx:37` — links to `/app/ai-confirmation`, but the real route requires a contract ID (`/app/contracts/:id/ai-confirmation`); remove or fix.
- `Opportunities.tsx:279` — `<SamImportPanel onImportSuccess={() => {}} />` is a no-op; should refetch the opportunities list.

### Schema vs. frontend mismatches (Platform Admin area, at last audit)
- **Plans:** frontend sent fields (`internalCode`, `setupFee`, `trialAllowed`, `maxOpportunities`, etc.) that don't exist in the `plans` table (which has `monthlyPrice`/`annualPrice` as decimal-as-string, `features` text, `maxUsers`, `maxContracts`, etc.). Backend router used `db.query.plans.findMany()`, which isn't available without a schema object passed to Drizzle — should be `db.select().from(plans)`.
- **Discounts:** same pattern — frontend fields (`discountType`, `value`, `name`, etc.) don't match the schema (`code`, `percentOff`, `amountOff`, `maxUses`, `currentUses`, etc.); same `db.query` vs `db.select().from()` issue.
- **Billing:** frontend referenced `b.billingStatus` (schema: `status`), `b.planName` (doesn't exist), `b.trialEndDate` (schema: `trialEndsAt`), `b.renewalDate` (closest is `currentPeriodEnd`).
- **Overrides:** frontend called `trpc.platformAdmin.overrides.list`, but that router only has mutations (`resetOnboarding`, `changePlan`, `transferOwnership`, `resetTrial`) — list/create/update/delete actually live on `trpc.platform.overrides`. Frontend also referenced `o.overrideType` (schema: `feature`) and `o.oldValue`/`o.newValue` (schema: `value`).
- `PlatformTasks.tsx` did `new Date(t.dueDate)` without a null check on a nullable field.

These are real, specific bugs — verify each against current source before treating as fixed or still-open; they were captured at a point in time and may have been partially addressed since.

### Workspace scoping
A full audit (`table_scoping_analysis.md`) concluded all tables without `workspaceId` are correctly platform-global, user-level, or record-level (child of a scoped parent) — **no additional scoping work is needed** as of that audit. Full breakdown in `docs/MASTER_SPECIFICATION.md` §4.

## Completion Criteria

The project is complete only when:

- Every page is production-ready.
- Every button functions.
- Every route functions.
- Every workflow completes successfully.
- Every AI feature operates correctly.
- No placeholder pages remain.
- No dead navigation exists.
- The v2 repository has been fully tested.

Only then should changes be considered for promotion back into the production repository.

## Release Process

Per `RELEASE_CHECKLIST.md` (production repo) — use this before every deploy to either repo's production-bound branch:

**Pre-deploy:** `pnpm test` passes with no failures; `npx tsc --noEmit` reports zero errors; `pnpm build` completes; any new schema changes pushed with `pnpm db:push` and reviewed in staging; all required secrets set (never hardcoded); Stripe keys correct for target environment (test vs. live).

**Legal/consent changes (required whenever `/terms` or `/privacy` content changes):** update the "Last Updated" date on the legal page; increment `CONSENT_VERSION` in `client/src/components/ConsentBanner.tsx` (forces re-consent for all users, including those who already accepted); verify the consent banner appears in a fresh/incognito session; optionally notify users by email for material changes; after deploy, confirm the new version appears in Platform Admin → Consent Records.

**Post-deploy verification:** site loads without console errors; login/OAuth flow works end-to-end; consent banner appears for new sessions; Consent Records show new entries after acceptance; Stripe checkout works (test card `4242 4242 4242 4242`); key flows tested (Onboarding → Dashboard → Contracts → Invoices).

**Stripe go-live (test → live keys):** claim the Stripe sandbox; complete KYC; replace test keys with live keys; test with a real card via the 99% discount promo code; verify webhooks fire in Stripe Dashboard → Developers → Webhooks; confirm subscription activation updates workspace access state correctly.

**GitHub push:** `git add -A && git commit -m "Release: <description>"` then `git push` to the configured remote.

## Your Role

You are part of a multi-AI engineering team. ChatGPT serves as the lead systems architect and maintains the overall product vision. Your responsibility is to implement that vision within the repository, keep the codebase clean and maintainable, and produce changes that are ready for review, testing, and eventual promotion to production.

Before implementing significant architectural changes, explain your reasoning. After implementing them, provide a concise summary of what changed, why it changed, and how it was verified.

## Planned Expansion

Still to be written with real project specifics (do not invent content — pull from source material as it's provided): Project Vision, System Architecture (deeper than §2/§5 of the Master Specification), Customer Workspace Architecture, Platform Admin Architecture, Coding Standards, Testing Standards, Migration Register Rules (detailed schema beyond § of Step 12 above), Current Priorities.
