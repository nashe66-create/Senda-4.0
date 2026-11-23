# Architecture and Code Audit

**Baseline:** `4bf9ed5dbe46e454baaa176f0c62df634230e173`  
**Audit date:** 23 November 2026  
**Scope:** exact `main` application, Prisma, API, UI, configuration and existing audit reports.

## Verdict

The repository is a coherent Next.js/TypeScript/PostgreSQL/Prisma prototype. It is suitable for a controlled sandbox and a small one-wedge pilot, but is not production-ready as payment infrastructure.

## Architecture

The implemented model is a monolith:

- Next.js App Router and server-rendered pages.
- Prisma 6.19.3 with PostgreSQL.
- Partner API-key lookup plus route-level domain functions.
- Institution, beneficiary, pay-link, obligation, attempt, instruction, confirmation and proof entities.
- Local JSON proof filesystem stub.
- Thin Biller dashboard and public/demo walkthrough pages.

The architecture is not a microservices deficiency. The immediate gaps are identity, integrity, state machines and durable evidence, not framework topology.

## Main workflow

1. `POST /api/v1/connect/validate` authenticates a partner and checks link, institution, obligation, amount, stale state and destination capability.
2. `POST /api/v1/connect/instruct` atomically creates an attempt and frozen instruction, then marks the obligation `instructed`.
3. `POST /api/v1/connect/confirm` authenticates the partner and checks attempt ownership, instruction reference, amount and currency.
4. A match writes confirmation/proof and sets attempt and obligation to `proven`; a mismatch sets `needs_reconcile` with no proof.

Relevant implementation: `apps/web/src/lib/connect.ts:120-288,328-472,481-743`; route handlers under `apps/web/src/app/api/v1/connect/`.

## Findings

| ID | Severity | Status | Finding |
|---|---|---|---|
| ARC-01 | High/P1 | CONFIRMED | Unsigned Biller session claims are accepted; `apps/web/src/lib/auth.ts:65-96` has no MAC/signature/expiry/server session. `/biller` and proof routes were returned 200 with a forged cookie. |
| ARC-02 | High/P1 | CONFIRMED | Idempotency key is globally unique and lookup is key-only; `apps/web/prisma/schema.prisma:236` and `apps/web/src/lib/connect.ts:372-400`. |
| ARC-03 | High/P1 | CONFIRMED | Two distinct retry keys created two active instructions for the same obligation in an isolated DB. Core gap: `apps/web/src/lib/connect.ts:192-195,397-454`; no obligation-level active-attempt constraint. |
| ARC-04 | High/P1 | CONFIRMED | An unauthenticated pilot handoff exposes attempt-linked organisation, student ref and proof metadata: `apps/web/src/app/api/v1/pilot/handoff/route.ts:11-98`. |
| ARC-05 | High/P1 | CONFIRMED | Public dogfood route mutates state and issues synthetic proof without authentication or environment guard: `apps/web/src/app/api/v1/dogfood/run/route.ts:28-83`. |
| ARC-06 | High/P1 | CONFIRMED | Pilot exposes a partner API key to browser application state: `apps/web/src/app/pilot/page.tsx:6-12,100`; `apps/web/src/app/pilot/pilot-client.tsx:79,101`. |
| ARC-07 | High/P1 | CONFIRMED | “Proven” means only matching partner-supplied reference/amount/currency, not independent credit or allocation: `apps/web/src/lib/connect.ts:526-527,632-743`; UI: `apps/web/src/lib/ui-labels.ts:8-13`. |
| ARC-08 | Medium/P2 | CONFIRMED | Proof JSON is written locally before DB transaction commit: `apps/web/src/lib/proofs.ts:9-21`, `apps/web/src/lib/connect.ts:659-740`. |
| ARC-09 | Medium/P2 | CONFIRMED | Destructive seed has no environment guard: `apps/web/prisma/seed.ts:16-31`. |
| ARC-10 | Medium/P2 | CONFIRMED | Confirmation timestamp is a plain string until a DB-facing `Date`; invalid dates are not rejected at Zod boundary: `apps/web/src/app/api/v1/connect/confirm/route.ts:32-40`; `apps/web/src/lib/connect.ts:655-657`. |
| ARC-11 | Medium/P2 | CONFIRMED | No application test script or tracked app test exists; `apps/web/package.json:5-17`. |
| ARC-12 | Medium/P2 | CONFIRMED | No application middleware/rate limiter is present in tracked files. |

## State and concurrency

- `instructPayment` loads a retry attempt before a transaction, creates the attempt/instruction and updates the obligation.
- If the unique key race occurs, it reloads the attempt and returns it.
- This is a race-safe replay implementation for the key itself, but not an entitlement-safe or obligation-serializing implementation.
- The same retry key plus partner A/B returned the partner A attempt during recheck.
- Two different keys returned two attempt IDs for one bill.
- Confirmation has a one-record-per-attempt unique constraint but no explicit confirmed-state guard at route validation. Transition semantics remain incomplete.

## Data flow

Partner credential → SHA-256 lookup in Prisma → route input parsing → domain validation → attempt/instruction transaction → partner confirmation transaction → proof record/local file.

The partner auth lookup is active-partner keyed by a SHA-256 API key hash. It does not provide key rotation, expiry, audience or scoped authorization metadata. A fast unsalted SHA-256 key lookup is less concerning than transport/secret handling only if keys are high entropy and still not exposed in browser state.

## Branch-only implementation differences

`origin/cursor/onboarding-dues-scenarios-53ef` adds one decision brief only. It codifies ops-assisted onboarding, thin destination/exception workflows, fee-template dues and stale/local-payment races. It contains no implementation and does not supersede source findings.

`origin/docs/kuva-cash-feedback-nov18` adds one directional research note. It identifies cash, regulation, cousin-cost and MTO appetite as open risks; it adds no code.

## Required remediation

1. Replace session/proof and partner credential handling.
2. Add composite `(partnerId,idempotencyKey)` uniqueness and ownership checks.
3. Add a DB-enforced one-active-attempt policy and atomic obligation transitions.
4. Split evidence states and add credit/allocation records.
5. Move proof writes behind durable post-commit publication.
6. Remove/publication-gate demo routes and browser key delivery.
7. Add executable API and PostgreSQL tests.

## Verification status

Source findings and loopback rechecks are evidence-based. No fix was made because this task is audit-only. Final status: **CONFIRMED**, with runtime results in `runtime-and-test-results.md`.
