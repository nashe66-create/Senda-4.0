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
