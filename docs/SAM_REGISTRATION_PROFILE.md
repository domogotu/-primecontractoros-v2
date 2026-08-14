# SAM.gov Registration Profile

This module turns the Business Profile into a maintained renewal record rather than a once-a-year questionnaire.

## Stored in the ordinary database
Business identity, formation, representations, NAICS/PSC, size calculations, operational data, POCs, lifecycle dates, taxpayer metadata with TIN last four, and bank metadata with account/routing last four.

## Intentionally not stored
Full TIN/EIN/SSN, full routing number, full account number, passwords, Login.gov credentials, or SAM.gov session data. If the product later needs full identifiers, they must live behind an approved secrets vault and separate permission boundary.

## Renewal workflow
- Maintain field-level verification dates and sources throughout the year.
- Remind at 120, 90, 60, 30, 14, and 7 days before expiration.
- Start the renewal process by 60 days before expiration.
- Generate masked worksheets by default.
- Record submission, processing, action-required, activation, and expiration history.
- Never send restricted registration data to AI features.

## Integration work remaining
- Add Drizzle declarations matching migration 0018.
- Add workspace-scoped tRPC CRUD and redacted audit calls.
- Replace plaintext routing/account fields in BusinessProfile.
- Add section editors and Renewal Readiness card.
- Generate renewal tasks idempotently.
