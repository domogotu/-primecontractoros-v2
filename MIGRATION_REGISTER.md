# PrimeContractorOS — Migration Register

Tracks every file migrated from `domogotu/primecontractoros` (production) into `domogotu/-primecontractoros-v2` (development), per the workflow defined in `CLAUDE.md`. Update this file every time a file is migrated — do not skip.

| # | Original Path | New Path | Classification | Status | Dependencies Still Missing in v2 | Verification Status | Commit |
|---|---|---|---|---|---|---|---|
| 1 | `drizzle/schema.ts` | `drizzle/schema.ts` | Improve (added `admin_invites` table) | Migrated | — (schema file is self-contained) | TypeScript not run in v2 (no build environment here) — verify with `npx tsc --noEmit` before trusting | `aeb8c9f` |
| 2 | `server/platformAdminRouter.ts` | `server/platformAdminRouter.ts` | Improve (`onboarding.sendLink` now persists to `admin_invites`; added `onboarding.list` query) | Migrated | `server/_core/trpc.ts`, `server/db.ts`, `server/accessGating.ts` — none of these exist in v2 yet, so this file will not compile in isolation | Not yet verified against a real build — logic reviewed by hand (Steps 1–8 of the modernization workflow), not compiled | `13d471c` |
| 3 | `client/src/pages/PlatformOnboarding.tsx` | `client/src/pages/PlatformOnboarding.tsx` | Improve (hardcoded `onboardingUsers` mock array replaced with `trpc.platformAdmin.onboarding.list.useQuery()`) | Migrated | `@/lib/trpc` (tRPC client binding), `@/components/ui/*` (shadcn components), `sonner`, `lucide-react` — none of these exist in v2 yet | Not yet verified against a real build; one bug (double-escaped `\u2026`) found and fixed before push — see commit `db1918a` | `db1918a` (fix), `915d3c0` (original push) |

## Known gap: v2 is not yet a complete working mirror

Per `CLAUDE.md`'s Primary Objective, Phase 1 should be a fully working development copy of production **before** modernization work begins. That has not happened yet — v2 currently contains only:

- `README.md`, `CLAUDE.md`, `docs/MASTER_SPECIFICATION.md` (documentation)
- `drizzle/schema.ts`, `server/platformAdminRouter.ts`, `client/src/pages/PlatformOnboarding.tsx` (code, migrated to support this one fix)

Everything else — `server/_core/*`, `server/db.ts`, `server/accessGating.ts`, `server/entityRouters.ts`, the full `client/src/` tree, `shared/`, config files (`package.json`, `vite.config.ts`, `drizzle.config.ts`, etc.) — has not been copied over. **None of the three files above will actually build or run in v2 until the rest of the codebase is migrated.**

This is a tooling constraint, not a decision: file-by-file GitHub writes were used because no bulk import/fork/clone tool was available. A real Phase 1 mirror would need either direct git access (clone → push) or a purpose-built bulk-copy tool, neither of which is available here.

**Recommended next step:** decide whether to (a) continue migrating files opportunistically as each modernization task touches them, accepting that v2 won't build until enough of the tree exists, or (b) do a dedicated bulk-mirror pass — which would need to happen outside this chat (e.g., `git clone` production, `git remote add` v2, `git push`) since it's not achievable through one-file-at-a-time API writes in reasonable time.
