# PrimeContractorOS V2

**Development and controlled-modernization repository for PrimeContractorOS**

> Production reference: `domogotu/primecontractoros`  
> Development repository: `domogotu/-primecontractoros-v2`

PrimeContractorOS is the government-contracting operating system owned by **Reeds Solutions LLC**. It is intended to support the lifecycle from opportunity intake through proposal, award, contract operations, finance, closeout, and lessons learned.

## Current repository status

This V2 repository is **not yet a complete runnable mirror of production**.

At the current control checkpoint, the repository contains V2 documentation, the separate `unified-ai-ecosystem/` workstream, and only a limited subset of PrimeContractorOS application source. Do not treat filenames, historical reports, screenshots, or this README as proof that the full application currently builds or that a listed feature is implemented.

Before feature remediation begins, the complete production application tree must be mirrored safely into V2, reconciled with V2-only files, and validated with install, typecheck, lint, test, build, migration, security, route, API, schema, and integration inventories.

## Repository safety rules

- Treat `domogotu/primecontractoros` as a **read-only production reference** during V2 development.
- Perform PrimeContractorOS development only in V2 branches and pull requests.
- Never copy `.git`, dependencies, build outputs, caches, local databases, uploads, `.env*`, credentials, tokens, connection strings, or customer data into V2.
- Never hardcode credentials or API keys as source-code fallbacks.
- Do not promote V2 to production without explicit owner approval after release gates pass.
- Keep PrimeContractorOS and `unified-ai-ecosystem/` as separate workstreams.

## Required reading

Before changing PrimeContractorOS, read:

1. `CLAUDE.md`
2. `docs/AUTHORITATIVE_REQUIREMENTS_REGISTER.md`
3. `docs/SOURCE_RECONCILIATION.md`
4. `docs/V2_EXECUTION_BACKLOG.md`
5. `docs/ACCEPTANCE_TRACEABILITY_MATRIX.md`
6. `docs/MASTER_SPECIFICATION.md` when present and reconciled
7. `MIGRATION_REGISTER.md`

These documents define repository boundaries, intended behavior, evidence rules, execution gates, and acceptance criteria.

## PrimeContractorOS target architecture

The production/reference application has historically used a TypeScript stack centered on React, Express, tRPC, Drizzle ORM, MySQL/TiDB-compatible persistence, Vite, and Vitest. The exact V2 toolchain, versions, scripts, dependencies, routes, schema, integrations, and environment requirements must be regenerated from the complete mirrored codebase before they are treated as current V2 facts.

## Lifecycle target

`Opportunity -> Proposal -> Awarded Contract -> Active Operations -> Finance -> Closeout -> Lessons Learned`

Core requirements include workspace isolation, role enforcement, real persistence, auditability, functional navigation, source-linked review-first AI, carry-forward of approved data, separate contract finance and SaaS billing, and no fake customer-facing success states.

## Development checkpoint

The immediate PrimeContractorOS objective is:

1. Secure the V2 repository.
2. Complete a safe full-tree production-to-V2 mirror.
3. Reconcile V2-only and already-modernized files intentionally.
4. Produce a baseline build and architecture report.
5. Verify security and tenancy.
6. Repair schema/API/UI contracts.
7. Complete routes, pages, actions, lifecycle, finance, AI, legal/operations, and release gates in order.

See `docs/V2_EXECUTION_BACKLOG.md` for the controlled execution sequence.

## Separate Unified AI Ecosystem workstream

`unified-ai-ecosystem/` is a separate project. Its specifications, build status, workflow exports, and phase gates must not be interpreted as PrimeContractorOS application requirements unless explicitly approved as a cross-project integration.

## Visibility

The repository should be treated as proprietary development material. If GitHub reports the repository as public, changing repository visibility to **Private** is a repository-administration action that must be completed before sensitive or complete application source is mirrored into V2.

## License

Private/proprietary — **Reeds Solutions LLC. All rights reserved.**
