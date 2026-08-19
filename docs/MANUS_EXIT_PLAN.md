# Manus Exit Plan

Status: implementation branch in progress

## Objective

Run PrimeContractorOS without requiring Manus credits, credentials, OAuth, storage, CDN, or Forge APIs.

## Protected rollout

The production Render service remains on the current branch while this work is developed and tested on `agent/remove-manus-dependencies`. Do not merge until the authentication migration and data checks pass.

## Dependency register

| Capability | Current state | Permanent target | Cutover gate |
|---|---|---|---|
| Web hosting | Render Starter | Render paid web service | Health check and smoke tests pass |
| Source control | GitHub | GitHub | Branch protections and CI pass |
| Database | External MySQL | Confirm provider; retain or migrate without data loss | Backup, row counts, ownership checks |
| Authentication | Manus OAuth | PrimeContractorOS credentials and secure session cookies | Owner recovery, invitations, logout, rate limits |
| AI | OpenAI with Manus fallback | OpenAI only, fail closed | Missing-key and successful-call tests |
| File storage | Manus proxy plus S3 support | S3-compatible private object storage | Upload, signed download, delete tests |
| Email | Resend | Resend | Domain and delivery tests |
| Billing | Stripe | Stripe | Webhook signature and checkout tests |
| Branding assets | Manus CDN | Repository or owned object storage | No Manus URLs in production bundle |
| Domain | Pending final cutover | PrimeContractorOS custom domain on Render | TLS and redirect checks |

## Non-negotiable safeguards

- Preserve existing user, workspace, membership, role, and audit records.
- Never redirect production login to an untested replacement.
- Keep secrets only in Render's environment manager.
- Store passwords only as slow salted hashes; never log credentials or reset tokens.
- Use HttpOnly, Secure, SameSite cookies and rotate sessions after login.
- Rate-limit login and recovery endpoints.
- Back up and reconcile the database before any provider migration.
- Keep the current production deployment available until rollback testing passes.

## Work order

1. Remove Manus AI fallback and fail closed when OpenAI is not configured.
2. Implement provider-independent credentials, sessions, recovery, and invitations.
3. Replace Manus storage proxy with a single private S3-compatible backend.
4. move branding assets off Manus CDN and remove Manus runtime code.
5. Identify the current MySQL provider and create a verified backup.
6. Deploy the branch as a separate Render preview/staging service.
7. Run authentication, tenancy, files, email, Stripe, AI, and lifecycle smoke tests.
8. Attach the custom domain only after acceptance and retain a rollback window.
