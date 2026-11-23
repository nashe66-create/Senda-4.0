# Senda 4.0 Repository Audit

- **Repository:** `nashe66-create/Senda-4.0`
- **Baseline reviewed:** `main`
- **Review date:** 23 November 2026
- **Review type:** Initial read-only repository and implementation audit
- **Status:** Substantive first audit; not yet a complete forensic audit

## Executive assessment

Senda 4.0 is a sound strategic and architectural foundation for the B2B cross-border bill-payment infrastructure proposition. Continue from the existing codebase; a rebuild is not justified by the findings in this review.

The current application is an early-stage prototype/sandbox, not a production-ready payment network. The repository contains a product/research pack, a relational data model, Connect validate/instruct/confirm operations, a Biller surface and a guided pilot walkthrough. The reviewed material does not demonstrate a live remittance partner, bank or wallet integration.

The main gaps are security, biller operations, evidence quality, reconciliation, automated integration testing and live partner validation.

## Scope and limitations

The review inspected principal product and research documents, the Prisma schema, core Connect implementation, authentication and proof code, selected Biller/API endpoints, the testing validator, branch comparisons and available pull-request history.

The initial repository inventory reported 10 branches, 87 tracked files on the main tree, 32 commits in the returned initial history, 15 pull requests, and no GitHub Actions workflow runs returned by the queried endpoint.

**This is not yet a complete line-by-line audit of every tracked file, every historical blob, every commit diff or every branch.** The connected GitHub tools permit repository reads and writes, but expose discrete API operations rather than a local Git checkout and shell. The earlier review did not complete systematic retrieval of all blobs and diffs. The application was not run locally, and migrations, tests, linting and runtime behaviour were not independently executed during this review.

## Strategic assessment

The product direction is coherent: remittance partners retain customer acquisition, KYC, collection, FX and payment execution; Senda supplies biller onboarding, verified directory, customer/account references, obligation validation, payment instructions, confirmation ingestion, reconciliation, evidence and exception management.

Biller participation must not depend on APIs. The product should support assisted onboarding, CSV/XLSX imports, pay codes, periodic obligation updates, statement uploads, manual matching and biller confirmation, with APIs as an optional later integration.

Flutterwave or another local PSP should remain an optional rail, not a mandatory dependency. Senda should not become a consumer remittance app or hold funds as part of its core proposition without a separately reviewed regulatory and commercial reason.

## Architecture and data model

The chosen stack—Next.js App Router, TypeScript, PostgreSQL and Prisma—is appropriate for this stage. A microservices rebuild is not indicated.

The reviewed schema includes Partner, Institution, SchoolUser, SettleDestination, Beneficiary, Link, FeeTemplate, Obligation, Attempt, Instruction, Confirmation and Proof.

The model is a good school-fee starting point but contains school-specific concepts such as studentRef, grade, FeeTemplate and SchoolUser. Evolve towards generic Biller, CustomerAccount, Beneficiary, Obligation, PaymentInstruction and PaymentEvidence concepts, while retaining school-specific attributes where needed. Add obligation version history so changes to fees and balances can be reconstructed for disputes. Explicitly validate supported currencies and destination-currency compatibility.

## Connect API findings

The core endpoints are:
- `POST /api/v1/connect/validate`
- `POST /api/v1/connect/instruct`
- `POST /api/v1/connect/confirm`

Validation checks pay-code state, institution status, beneficiary/obligation consistency, amount, staleness, destination verification and partner corridor/destination capability. Instruction creation records an attempt, unique reference and frozen payout destination. Confirmation compares reference, amount and currency; mismatches lead to `needs_reconcile` and do not issue proof.

### High-priority finding: retry-key partner isolation

The reviewed `instructPayment` logic searches for an existing attempt using the retry key and compares payment details, but does not appear to verify that the existing attempt belongs to the calling partner before replaying it. The database idempotency key is globally unique rather than scoped to a partner.

**Required:** scope retry keys to partner; enforce a composite uniqueness constraint such as `(partnerId, idempotencyKey)`; check partner ownership before replay; add cross-partner replay tests.

### High-priority finding: Biller session authentication

The reviewed `auth.ts` implementation encodes session JSON using Base64 and decodes/trusts its fields. Base64 is not a cryptographic signature or authentication mechanism. A constructed or modified cookie may permit impersonation or cross-institution access if no other protection intervenes.

**Required:** use signed or server-side sessions, password hashing, expiry and revocation, secure HttpOnly cookies, role-based authorisation and audit logs. Do not expose this login to real institutions until fixed and tested.

### Confirmation and proof semantics

The implementation can create a proof when partner-submitted reference, amount and currency match. This establishes a matching partner attestation, not independent proof that a school's bank account was credited or that the payment was allocated to a student's account.

Use distinct lifecycle states:
- `instructed`: Senda issued payment instructions.
- `partner_confirmed`: partner attests it executed/sent the payment.
- `credited`: evidence supports credit to the destination account.
- `allocated`: biller confirms allocation to the relevant customer/obligation.
- `needs_reconcile`: evidence is missing, conflicting or disputed.

The existing `proven` label should not be used to imply independently verified receipt. Add explicit eligible-state checks for confirmation, require a valid partner association, and validate `settled_at` at the request boundary.

### Proof storage

The reviewed proof implementation writes JSON to the local filesystem. This is suitable for a local prototype, not production deployment. Writing a file inside a database transaction can leave an orphaned file if the transaction subsequently fails. Move to durable object storage and a post-commit/outbox workflow with retry and integrity controls.

## Biller and onboarding assessment

The Biller surface supports a useful early view of amounts due, beneficiaries, destination checks, payment status, exceptions and proof download. However, the reviewed M5 description explicitly defers CSV import and describes a read-only roster.

Not demonstrated as complete: school registration, KYB document collection and review, authorised representative verification, payout account ownership verification, bulk student import, bulk obligation generation, fee-template management, biller receipt confirmation, allocation correction and destination-change approval.

Start with an operations-assisted onboarding workflow for the first 5–10 schools. Do not overbuild self-service before proving school participation.

## Research assessment

The research pack includes demand/MTO, school supply, rails/stack, wedge comparison, school-received confirmation, Bharat Connect/BBPS, lock brief and research plan material.

Strengths: it distinguishes remittance corridor size from actual school-fee volume; acknowledges that UK-to-Zimbabwe school-fee volume is not established by published data; considers purpose-payment competitors; and recognises that partner payment confirmation is not the same as school receipt.

Unproven commercial hypotheses include MTO willingness to buy Connect, whether partners can pass references through existing payout systems, school willingness to maintain records, school willingness to pay, and sufficient biller network density. Add a source register with URL, publisher, publication/access dates, supported claim and confidence. External claims were not all independently revalidated in this audit.

## Testing assessment

The repository includes a testing pack described as 95 structured YAML cases, a scenario catalogue, coverage map, fixtures, agent briefs and a Python validator. This is a strong acceptance-test specification.

The validator checks pack structure and coverage; it is not equivalent to executing all 95 scenarios against the application. Pull-request descriptions record local test claims, but these were not independently repeated in this audit.

Required: unit tests for domain logic; PostgreSQL integration tests; cross-partner and cross-institution isolation tests; concurrent retry tests; authentication/authorisation tests; proof-access tests; reconciliation/dispute tests; and CI execution on every pull request. Convert scenario cases into executable API/integration tests progressively.

## Branch and pull-request assessment

The initial inventory identified 10 branches. Comparisons against main showed that most feature branches are behind main and their work appears incorporated or superseded. The onboarding-dues branch and Kuva feedback branch were reported as ahead of main and merit separate review before any merge. Do not merge branches merely because they are ahead.

The PR history records the product progression from pivot and research, through schema/scaffold, Connect hardening, Biller surface and M6 guided pilot. PR #8 and #9 were closed without merging; their work was superseded or absorbed by later changes.

A full commit-by-commit diff review remains outstanding.

## Priority risk register

| Priority | Finding | Required action |
|---|---|---|
| P1 | Retry key not scoped to partner | Composite partner/idempotency key and ownership check |
| P1 | Unsigned Biller session | Proper signed/server-side auth and authorisation |
| P1 | Proof semantics overstate partner attestation | Separate partner confirmation, credit and allocation |
| P2 | Incomplete biller onboarding | Assisted KYB, destination checks, imports and obligation workflows |
| P2 | No full obligation version history | Version obligations and preserve audit trail |
| P2 | Incomplete exception resolution | Operational queue, owner, actions and outcomes |
| P2 | Local proof storage | Durable object storage and reliable write workflow |
| P2 | No demonstrated live partner integration | One real partner and real payment pilot |
| P2 | Scenario pack not executed against API | Automated unit/integration/API suite and CI |
| P2 | School-specific model | Gradually generalise biller/customer/obligation concepts |

## Recommended development sequence

1. **Security and integrity:** fix partner-scoped idempotency, Biller authentication, authorisation, attempt lifecycle checks and evidence terminology.
2. **Real biller operations:** assisted KYB, payout destination verification, CSV/XLSX import, fee templates, bulk obligations, biller confirmation and allocation.
3. **Evidence and reconciliation:** partner attestations, bank statement ingestion, matching, biller confirmation, evidence history and disputes.
4. **Production Connect:** partner credentials, signed callbacks, webhook retries, rate limits, audit logs, object storage, monitoring and automated tests.
5. **Live pilot:** onboard real schools, agree one MTO workflow, execute real settlement, independently verify credit and biller allocation, and measure success and exception rates.

## What not to build yet

Do not rebuild the consumer remittance app, make Flutterwave mandatory, build a school ERP, launch multiple corridors simultaneously, or introduce AI reconciliation before real transaction data exists. Prove one partner-to-school payment workflow first.

## Final verdict

Continue Senda 4.0. The business direction and stack are appropriate. The key weakness is that operational trust, security and evidence have not caught up with the API demonstration. Prioritise those areas over additional product surfaces.

## Outstanding work required for a complete forensic audit

- Obtain a complete repository snapshot or systematically enumerate every tree and blob on all branches.
- Read every unique tracked file and identify binary, generated, vendored, secret-like or otherwise excluded content.
- Enumerate complete commit history with pagination and inspect each commit diff, including merges and deleted/renamed files.
- Inspect every branch-specific file and unmerged change.
- Inspect every PR diff and review/comment thread where available.
- Run dependency/security checks, migrations, unit/integration tests, lint and type checking in a controlled runtime.
- Run the app and verify critical flows and access-control boundaries.
- Record exact commit SHA, test commands, outputs and any inaccessible items.

This document records the findings of the initial audit only. It must not be represented as a completed exhaustive forensic audit until the outstanding work above has been completed.


---

# Exhaustive audit continuation — 23 November 2026

## Verified repository inventory and branch-tree results

Repository metadata was re-read from GitHub:
- Default branch: `main`
- Visibility: public
- Connected permissions reported: pull, push, maintain and admin
- Repository size reported by GitHub: 329 KB
- Branches returned by GitHub: 10
- Main recursive tree: 131 entries including directory nodes; 88 tracked file blobs
- All ten recursive branch-tree requests returned `truncated: false`

The ten branch tips inspected were:
- `main`
- `cursor/add-senda-4-pivot-doc-3bc0`
- `cursor/biller-bursar-surface-8d87`
- `cursor/connect-concepts-doc-9c8e`
- `cursor/connect-partner-hardening-1927`
- `cursor/mismatch-kyb-checklist-7986`
- `cursor/onboarding-dues-scenarios-53ef`
- `cursor/scaffold-mvp-app-3a57`
- `cursor/wedge-pilot-loop-ee1f`
- `docs/kuva-cash-feedback-nov18`

Branch-tree comparison against main:
- `main`: 88 files.
- `cursor/biller-bursar-surface-8d87`: 82 files; six main paths absent, no branch-only paths.
- `cursor/connect-concepts-doc-9c8e`: 38 files; documentation-only snapshot, no branch-only paths.
- `cursor/connect-partner-hardening-1927`: 81 files; seven main paths absent, no branch-only paths.
- `cursor/mismatch-kyb-checklist-7986`: 79 files; nine main paths absent, no branch-only paths.
- `cursor/onboarding-dues-scenarios-53ef`: 88 files; adds `docs/senda-4.0/product/onboarding-dues-scenarios.md`; audit report absent because it predates the report commit.
- `cursor/scaffold-mvp-app-3a57`: 77 files; earlier scaffold snapshot, no branch-only paths.
- `cursor/wedge-pilot-loop-ee1f`: 87 files; audit report absent because it predates the report commit.
- `docs/kuva-cash-feedback-nov18`: 35 files; documentation/research snapshot and adds `docs/senda-4.0/research/kuva-cash-feedback.md`.
- `cursor/add-senda-4-pivot-doc-3bc0`: 2 files; earliest pivot-only snapshot.

The branch trees show two branch-only tracked documents across the ten branch tips: the onboarding/dues scenarios brief and the Kuva Cash feedback note. Older branches omit later main files; absence is not evidence of deletion from main. No branch has been merged or modified as part of this audit.

## Complete commit-list pagination

GitHub REST commit listing was requested with `per_page=100`, page 1 and page 2. Page 1 returned 33 commits; page 2 returned zero. This verifies 33 commits in the returned history at the time of inspection. Commit-by-commit diff inspection is still in progress; the commit list alone is not a complete historical code review.

## Pull request inventory

GitHub returned 15 pull requests:
- #15 — open, onboarding + dues freshness decision scenarios; branch `cursor/onboarding-dues-scenarios-53ef`.
- #14 — closed and merged, M6 wedge pilot end-to-end loop.
- #13 — closed and merged, M5 Biller surface.
- #12 — closed and merged, M4 Connect partner hardening.
- #11 — closed and merged, mismatch dogfood and KYB checklist.
- #10 — closed and merged, plain-language pass.
- #9 — closed without merge, Connect/Biller conceptual model.
- #8 — closed without merge, M1 app scaffold.
- #7 — closed and merged, school-received confirmation research.
- #6 — closed and merged, scenario test pack.
- #5 — closed and merged, Zimbabwe settlement methods decision.
- #4 — closed and merged, research pack and stack decision.
- #3 — closed and merged, Bharat Connect study.
- #2 — closed and merged, durable Senda 4.0 docs.
- #1 — closed without merge, pivot document.

The pull request inventory is verified; a full review of all PR discussion/review comments and every per-file patch remains outstanding.

## Additional source-level findings confirmed from main

### P1 — Biller session token is forgeable
File: `apps/web/src/lib/auth.ts`; login route: `apps/web/src/app/api/v1/biller/login/route.ts`.

The cookie payload is JSON encoded as Base64URL. `getBillerSession` decodes and trusts `userId`, `institutionId` and `email`; it does not verify a MAC/signature, look up a server-side session, or check expiry/revocation. The login route sets HttpOnly and SameSite=Lax but does not set Secure explicitly. HttpOnly prevents JavaScript reads; it does not prevent a client constructing a cookie. Treat this as a critical cross-tenant access risk until replaced by authenticated, integrity-protected sessions and verified server-side authorisation.

### P1 — retry-key replay is not partner-scoped
Files: `apps/web/src/lib/connect.ts`; `apps/web/prisma/schema.prisma`; `apps/web/prisma/migrations/20261119092035_init_domain/migration.sql`.

The schema makes `Attempt.idempotencyKey` globally unique. The existing-attempt lookup uses only `idempotencyKey`. Replay comparison checks link, obligation and amount, but not the calling partner. This creates a cross-partner replay/confidentiality and payment-instruction disclosure risk if two partner credentials use the same retry key and know or can submit the same payment tuple. Scope the key by partner and enforce partner ownership before replay. Add a cross-partner isolation test and a concurrent same-partner retry test.

### P1/P2 — pilot handoff endpoint is unauthenticated
File: `apps/web/src/app/api/v1/pilot/handoff/route.ts`.

The GET handler accepts an `attempt_id` query parameter and returns organisation, beneficiary/student reference, amount, payment reference, partner, confirmation/reconciliation details and proof metadata. It does not require partner authentication or a Biller session. Its own comment calls it pilot/sandbox glue, but if reachable in a deployed environment it is an unauthenticated data disclosure/IDOR surface. Disable outside local/demo mode or enforce scoped authorisation and minimise returned personal/payment data.

### P1 — partner confirmation is labelled as “proven”
Files: `apps/web/src/lib/connect.ts`; `apps/web/prisma/schema.prisma`; Connect confirm route.

A matching partner-supplied reference, amount and currency changes attempt/obligation state to `proven` and creates `senda.proof.v1`. The pilot handoff explicitly says this is sandbox partner attestation, not a live MTO webhook or bank-credit feed. The proof payload itself records source, but the lifecycle label and “payment proof” wording can overstate what has been independently verified. Rename or split states into partner-confirmed, credited and biller-allocated, and identify the evidence source prominently. Do not claim bank credit or allocation without independent evidence.

### P2 — proof file is written inside the database transaction
File: `apps/web/src/lib/proofs.ts`; caller: `apps/web/src/lib/connect.ts`.

Proof JSON is written to local disk before the Prisma transaction commits. A later database failure can leave an orphaned file. Local filesystem storage is also not durable/shared storage for horizontally scaled or ephemeral deployments. Use durable object storage and an outbox/post-commit workflow with retries and integrity checks.

### P2 — destructive seed script
File: `apps/web/prisma/seed.ts`.

The seed script deletes all records from the domain tables in FK-safe order before recreating demo fixtures. This is appropriate only for an isolated development database. Guard it explicitly against production environments and document that running it destroys existing domain data.

### P2 — school-specific schema constrains the wider biller proposition
File: `apps/web/prisma/schema.prisma`.

The current model includes `SchoolUser`, `Beneficiary.studentRef`, `grade`, `FeeTemplate` and school-fee terminology. This is acceptable for the first school wedge, but it is not yet a general-purpose biller/account/obligation model for utilities, healthcare, rent or insurance. Generalise only as real second-vertical requirements emerge; avoid premature abstraction.

## Runtime environment discovery

The connected Replit account search returned an app named `senda3.0`, last updated 14 October 2026, not a Senda 4.0 runtime. It is not treated as the target repository or as evidence that Senda 4.0 can be executed. No runtime was launched and no dependency installation, migration, test, lint, typecheck or browser-flow result is claimed in this continuation.

GitHub API access is sufficient to inspect repository trees, file contents, commits, branches and PRs. It is not itself a local shell/runtime. A controlled execution environment still needs to be established against the exact `main` commit before runtime tests can be reported.

## Current completion status

| Workstream | Status |
|---|---|
| Repository metadata/default branch | Verified |
| Main recursive inventory | Verified: 88 file blobs |
| Ten branch trees | Verified; none truncated |
| Branch-only files | Identified: two documents |
| Commit-list pagination | Verified: 33 commits, no second page |
| PR inventory | Verified: 15 PRs |
| Every unique text/code blob | In progress; not complete |
| Every commit diff, including rename/delete history | In progress; not complete |
| Every PR patch and discussion/review | In progress; not complete |
| Full research source/claim verification | Not complete |
| Runtime install/migrate/test/lint/typecheck | Not run |
| Browser/exercise of application | Not run |

This continuation adds verified inventory and code findings, but does not change the overall audit status to complete. No application code, data, branch or PR has been modified.
