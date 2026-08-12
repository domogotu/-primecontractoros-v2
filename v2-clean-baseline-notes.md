# v2-clean-baseline notes

This branch is a byte-perfect mirror of `domogotu/primecontractoros@main` (commit `8b85cb876d2b1937e7c0d6a55a2dc77249fc5cda`, mirrored 2026-08-11) with one deliberate exception.

## Missing on purpose

**`.project-config.json` is NOT included on this branch.** In production `main`, this file contains live, unredacted credentials in plaintext:

- `DATABASE_URL` — full MySQL/TiDB connection string with username and password
- `JWT_SECRET`
- `BUILT_IN_FORGE_API_KEY` and `VITE_FRONTEND_FORGE_API_KEY`
- `OWNER_OPEN_ID`
- A set of AWS STS credentials (access key id, secret key, session token). Their stated `expiration` is `2026-06-10`, which is already past as of this mirror, so those specific values should be dead — but the database password and JWT secret have no expiration and may still be live.

`domogotu/primecontractoros` is a **public** repository, so this file has been openly exposed in git history the whole time this file existed there.

## Recommended remediation (not yet done as of this note)

1. Rotate the database password, `JWT_SECRET`, and both Forge API keys.
2. Scrub `.project-config.json` from production's git history entirely using `git filter-repo` or BFG Repo-Cleaner — deleting the file going forward is not enough, since it remains recoverable from old commits in a public repo.
3. Add `.project-config.json` to `.gitignore` in production.

## Scope of this mirror

- 478 of 479 files from production `main` copied byte-for-byte (only `.project-config.json` withheld, for the reason above).
- Everything already on `-primecontractoros-v2`'s `main` branch (docs, `unified-ai-ecosystem/`, prior modernization work, etc.) was left untouched — this mirror lives entirely on this separate `v2-clean-baseline` branch.
- No dependency install or build was run against this branch; it has not been verified to `pnpm install && pnpm build` cleanly.
