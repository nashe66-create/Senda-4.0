# Senda 4.0 remediation roadmap

**Baseline:** `4bf9ed5dbe46e454baaa176f0c62df634230e173`  
**Status:** Audit complete; remediation not begun as part of this audit.

## Release principle

No real partner credential, biller account, customer data or settlement may be used until the P1 security and integrity findings are fixed and independently verified.

## Phase 0 — stop unsafe exposure

Owner: application/security

1. Disable the dogfood and pilot-handoff routes in production.
2. Remove all partner credential values and fallback keys from browser props and bundles.
3. Fail the seed script outside an explicitly named disposable fixture database.
4. Bind the local PostgreSQL Compose port to loopback.

Acceptance:

- Production requests cannot call demo-write or handoff routes.
- Browser HTML/RSC/bundles contain no partner key.
- Fixture seed exits before writes in production or shared environments.

## Phase 1 — secure tenant and partner boundaries

Owner: application/security

1. Replace forgeable Biller cookies with signed expiring sessions or opaque server-side sessions.
2. Store password hashes, verify users and institutions on every request, and support expiry/revocation.
3. Set Secure/HttpOnly/SameSite cookies and add CSRF controls where cookies authorize state changes.
4. Add partner-scoped idempotency:
   - composite `(partnerId, idempotencyKey)` unique constraint;
   - lookup and ownership verification;
   - no partner-specific data in cross-partner conflict responses.
5. Prevent multiple active instructions for one obligation with database-backed atomic transitions.

Acceptance:

- Tampered, expired and revoked cookies fail.
- Cross-institution proof, dashboard and account access fail.
- Cross-partner retry returns no attempt/payment details.
- Sequential and concurrent duplicate instruction tests preserve one active attempt.

## Phase 2 — evidence and lifecycle correctness

Owner: payments/product/data

1. Introduce explicit states: `instructed`, `partner_confirmed`, `credited`, `allocated`, `needs_reconcile`, `failed`, `reversed` and `disputed` as needed.
2. Separate partner attestation evidence from credit evidence and biller allocation evidence.
3. Rename UI/API proof claims to describe the evidence issuer and verification level.
4. Validate confirmation timestamps and allowed state transitions in route and transaction code.
5. Add immutable obligation versions for amount/status/due-date changes.

Acceptance:

- Partner confirmation alone is never rendered or serialized as credited or allocated.
- Invalid timestamps and disallowed transitions return stable validation errors.
- A state transition cannot bypass the required evidence or partner ownership.
- Obligation disputes can reconstruct prior versions.

## Phase 3 — durable proof and reconciliation

Owner: platform/payments/operations

1. Replace local proof JSON storage with authorized durable object storage.
2. Store proof metadata in PostgreSQL and publish proof artifacts post-commit through an outbox/retry workflow.
3. Add proof integrity identifiers and controlled retrieval.
4. Build reconciliation queues for mismatch, missing evidence, failed settlement and disputes.
5. Define ownership, actions, retry limits and audit history.

Acceptance:

- Proof retrieval survives app/container restarts and multiple instances.
- Storage/DB failure does not leave an inconsistent proven state.
- Reconciliation records preserve evidence and every operator action.
- Access tests cover partner, institution and unauthorized roles.

## Phase 4 — executable test and CI gates

Owner: engineering/QA

1. Add unit tests for validation, lifecycle and retry logic.
2. Add disposable-PostgreSQL integration/API tests.
3. Add:
   - cross-partner replay;
   - cross-institution and IDOR access;
   - concurrent instructions;
   - duplicate confirmations;
   - invalid/stale/closed obligations;
   - wrong amount/currency/reference;
   - proof authorization and storage failure.
4. Add `npm test`/CI scripts and run lint, typecheck, build and migration validation on every PR.
5. Run dependency advisory scans and secret scanning.

Acceptance:

- Every P1 finding has a deterministic automated regression test.
- The 95-case scenario pack is mapped to executable tests progressively.
- CI blocks merge on security, build or migration regressions.

## Phase 5 — assisted real-biller operations

Owner: product/operations

1. Define institution registration and documented assisted KYB.
2. Verify representative authority and settlement destination ownership.
3. Support controlled roster and obligation import, including review and rollback.
4. Add fee-template and bulk-obligation tools only after the destination model is stable.
5. Define manual allocation confirmation and exception correction.

Acceptance:

- One operator can onboard and suspend a test institution.
- Destination changes require review and preserve history.
- Import failures are quarantined with actionable reports.
- Biller staff can confirm or dispute allocation with audit trail.

## Phase 6 — controlled live pilot

Owner: product/partner/operations/compliance

1. Select one partner, one biller and one corridor.
2. Complete partner technical review and credential/whitelist configuration.
3. Confirm independent settlement-credit evidence is available.
4. Run sandbox and real-money rehearsals with limited value and named reversals.
5. Publish incident, privacy, retention and customer-support procedures.

Pilot acceptance criteria:

- Partner, credit and allocation evidence are independently distinguishable.
- Every instruction has one active attempt and one immutable payment reference.
- A real payment can be validated, instructed, credited, allocated and proven end-to-end.
- Negative and duplicate scenarios are safe.
- Reversal/dispute operations have audit and confirmation paths.
- The partner and biller agree success, exception and evidence ownership.
