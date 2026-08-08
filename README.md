# PrimeContractorOS V2

**Development and controlled-modernization repository for PrimeContractorOS**

> Production reference: `domogotu/primecontractoros`  
> Development repository: `domogotu/-primecontractoros-v2`

PrimeContractorOS is the government-contracting operating system owned by **Reeds Solutions LLC**. It is intended to support the lifecycle from opportunity intake through proposal, award, contract operations, finance, closeout, and lessons learned.

## Current repository status

V2 now contains the complete mirrored PrimeContractorOS application baseline from `domogotu/primecontractoros`, reconciled with V2-only governance files and the V2 files that had already been modernized before the mirror.

The mirror baseline has been verified with dependency installation, an ephemeral MySQL migration run, TypeScript checking, the repository test suite, and a production build. Modernization is active on controlled V2 branches. Historical reports, screenshots, and old audit notes remain useful evidence, but each reported defect must be verified against current source before it is treated as open.

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
6. `docs/MASTER_SPECIFICATION.md`
7. `MIGRATION_REGISTER.md`

These documents define repository boundaries, intended behavior, evidence rules, execution gates, and acceptance criteria.

## Current verified toolchain

The mirrored application is a TypeScript system centered on React, Express, tRPC, Drizzle ORM, MySQL/TiDB-compatible persistence, Vite, pnpm, and Vitest. The baseline validation runs against an ephemeral MySQL service so database-dependent tests can execute without using production data or credentials.

## Lifecycle target

`Opportunity -> Proposal -> Awarded Contract -> Active Operations -> Finance -> Closeout -> Lessons Learned`

Core requirements include workspace isolation, role enforcement, real persistence, auditability, functional navigation, source-linked review-first AI, carry-forward of approved data, separate contract finance and SaaS billing, and no fake customer-facing success states.

## Development checkpoint

Completed baseline gates:

1. Full-tree production-to-V2 mirror completed without modifying production.
2. V2-only governance and already-modernized files reconciled intentionally.
3. Dependency installation, ephemeral MySQL migrations, TypeScript checking, the full baseline test suite, and production build verified.
4. Security and tenancy modernization has started. Invoice/payment child records, contact links, and file versions have already been hardened against cross-workspace access and now have regression coverage.

Current objective: continue security and tenancy verification, then repair remaining schema/API/UI contracts and complete routes, pages, actions, lifecycle, finance, AI, legal/operations, and release gates in controlled, tested batches.

See `docs/V2_EXECUTION_BACKLOG.md` for the controlled execution sequence.

## Separate Unified AI Ecosystem workstream

`unified-ai-ecosystem/` is a separate project. Its specifications, build status, workflow exports, and phase gates must not be interpreted as PrimeContractorOS application requirements unless explicitly approved as a cross-project integration.

## License

Private/proprietary — **Reeds Solutions LLC. All rights reserved.**
