# Senda 4.0 full audit executive summary

**Audit baseline:** `4bf9ed5dbe46e454baaa176f0c62df634230e173`  
**Audit date:** 23 November 2026  
**Repository:** `nashe66-create/Senda-4.0`  
**Branch:** `main`

## Verdict

Senda 4.0 has a coherent sandbox prototype and product specification, but it is not ready for real partners, real billers, real customer data or real settlement. Continue the existing codebase only if the P1 security and payment-integrity findings are closed first. A rebuild is not currently justified.

The application successfully demonstrates a local Next.js, TypeScript, PostgreSQL and Prisma workflow. It does not demonstrate a live remittance rail, independent school receipt, durable proof system or operational biller service.

## 1. What has actually been built?

- A Next.js App Router prototype with Partner Connect-style validate, instruct and confirm APIs.
- A Prisma/PostgreSQL domain model for partners, institutions, destinations, beneficiaries, links, obligations, attempts, instructions, confirmations and proofs.
- A thin Biller dashboard, login, proof-download route and logout control.
- Pilot and dogfood walkthrough UI surfaces.
- A sandbox partner fixture and destructive demo seed.
- Local JSON proof-file stubs.
- Product, pivot, corridor, pricing, testing and operations documentation.
- A 95-case structured scenario pack and a Python pack validator.

## 2. What works?

The following were observed to compile or run in the local audit environment:

- Dependency installation from the app lockfile.
- Prisma schema validation and generation.
- ESLint and strict TypeScript checks.
- Next.js production build.
- Migration deployment to a disposable PostgreSQL 16 database.
- Fixture seeding into the disposable database.
- 95-case test-pack structure validation.
- Partner-key guarding for the Connect validate/instruct/confirm routes.
- Basic payment-reference, amount and currency reconciliation against instruction data.

Exact commands and outputs are recorded in [runtime-and-test-results.md](runtime-and-test-results.md).

## 3. What is incomplete?

- Proper Biller authentication, password hashing, session expiry/revocation and tenant authorization.
- Partner-scoped idempotency and duplicate-active-instruction prevention.
- Independent settlement credit and biller allocation states.
- Durable, shared proof storage and post-commit proof publication.
- Real institution/KYB and representative verification workflows.
- Payout-account ownership verification.
- CSV/XLSX import and bulk obligation/fee operations.
- Reconciliation queue, reversals, disputes and operational ownership.
- Executable API, integration and browser test suites.
- CI/dependency advisory controls and rate limiting.
- Live MTO, bank, wallet, callback, bank-credit or biller-reconciliation integrations.

## 4. What is mocked or simulated?

- The pilot partner and fixed API keys.
- Dogfood instructions and confirmations.
- Proof JSON written to `apps/web/proofs/`.
- The Biller login and its fixture account.
- Partner confirmation via `partner_api` or `dogfood_stub`, not live settlement evidence.
- Organisation, beneficiary and obligation fixture data.
- Most onboarding and operational workflows described in UI or documentation.

## 5. What is broken or unsafe?

The confirmed P1 issues are:

- [SF-01] Forgeable, unsigned Biller sessions.
- [SF-02] Different retry keys can create multiple active instructions for one obligation.
- [SF-03] Retry-key replay is not partner-scoped.
- [SF-04] A configured pilot partner key is exposed in browser-delivered application state.
- [SF-05] Dogfood writes and synthetic proof issuance are unauthenticated.
- [SF-06] Pilot handoff exposes attempt-linked institution and beneficiary data without authorization.
- [SF-07] Partner attestation is labelled as proven/confirmed evidence.
- [SF-08] Fixture seed can destructively delete domain data without a production guard.

Details, reproduction steps and acceptance criteria are in [security-findings.md](security-findings.md).

## 6. What has never been tested?

- Real remittance-provider settlement.
- Independent bank/wallet credit evidence.
- Real biller allocation and receipt confirmation.
- Cross-tenant browser/tenant-isolation automation.
- Concurrent instructions under PostgreSQL load.
- Full duplicate/replay/cancellation/reversal/dispute workflows.
- Durable proof retrieval after restart or across multiple app instances.
- Production TLS, proxy, secret storage, observability and rate limiting.
- Real school onboarding/KYB/legal/commercial workflows.
- A live dependency-vulnerability advisory scan.

The 95 YAML cases validate structurally but do not execute against the application; no app test script exists.

## 7. Readiness assessment

| Area | Rating | Basis |
|---|---|---|
| Product readiness | Not ready | Coherent sandbox; essential operations and evidence semantics incomplete. |
| Architecture readiness | Limited | Appropriate simple stack for a prototype; security and lifecycle controls need work. |
| Security readiness | Not ready | Unsigned sessions, cross-tenant/IDOR surfaces and public write routes. |
| Operational readiness | Not ready | No real KYB, onboarding, exception, dispute or settlement operations. |
| Integration readiness | Not ready | No live rail or biller integration; partner callbacks and credit feeds are absent. |
| Research/commercial validation | Unproven | Market and partner/biller hypotheses remain without controlled customer and transaction evidence. |
| Pilot readiness | Not ready | Sandbox is insufficient; fix P1 controls and perform a controlled real settlement. |
| Production readiness | Not ready | Do not deploy with real credentials or data yet. |

## 8. What prevents a real pilot?

1. Unsafe authentication and public unauthenticated mutation/disclosure.
2. Payment-integrity gaps around duplicate active attempts and cross-partner idempotency.
3. Proof language that implies independent credit/receipt evidence it does not contain.
4. No durable proof storage or operational reconciliation evidence.
5. No verified live settlement destination or partner/biller integration.
6. No executable integration, isolation or concurrency test suite.
7. Missing assisted onboarding and operational exception procedures.
8. Commercial/partner/biller willingness, pricing and corridor assumptions remain unvalidated.

## 9. Fix first

1. Replace Base64JSON Biller sessions with signed/server-side sessions and tenant authorization.
2. Scope idempotency keys by partner and enforce partner ownership.
3. Make active-attempt state transitions atomic and prevent duplicate instructions.
4. Remove or production-gate dogfood, pilot handoff and browser-held credentials.
5. Prevent destructive seeding outside an explicit demo fixture environment.
6. Split partner-confirmed, credited and allocated lifecycle/evidence states.
7. Replace local proof stubs with durable storage and post-commit publication.
8. Convert critical scenarios into PostgreSQL/API tests and run them in CI.

## 10. What should not be built yet?

- Consumer remittance UX or a remittance app.
- A school ERP or PSP core.
- Mandatory dependency on any single local PSP.
- Multiple corridors or a broad biller catalogue.
- AI reconciliation before real, labeled transaction data exists.
- Production marketing claims of confirmed receipt or allocated funds.
- Heavy self-service workflows before one real school and partner workflow succeeds.

## 11. Architecture decision

The existing Next.js/TypeScript/PostgreSQL/Prisma monolith is suitable for one controlled pilot. It should become a secure, auditable payment workflow with explicit evidence sources and operational controls before a microservices split.

Do not rebuild from scratch; the data model and API skeleton provide a useful starting point. Generalize school-specific naming gradually toward biller, customer account, obligation and evidence concepts without breaking the one-wedge pilot.

## 12. Pilot gate

A real pilot should begin only after P1 controls pass independent tests, one partner and one biller agree the evidence workflow, and all partner/bank/biller steps have named owners and reversible states. Initial success must measure validated instructions, successful independent credit evidence, biller allocation, proof retrieval and exception/reversal handling—not merely partner confirmation.

## Continuation audit reconciliation

The forensic continuation completed the repository-wide and Git evidence work at the same baseline:

- 88 tracked paths on `main` were enumerated and relevant executable/configuration/documentation content was reviewed.
- Ten remote branch tips were compared; 90 branch-tip paths were crosswalked.
- All 43 commits reachable through `git rev-list --all` were listed and patched: 34 on `main`, 4 unique to remote feature branches and 5 host-managed checkpoint refs.
- All 15 pull requests were identified and their exact file diffs cross-checked against local base/head diffs.
- Available PR issue comments, submitted reviews, inline comments and commit check/status endpoints returned no records.
- Independent disposable-PostgreSQL runtime rechecks confirmed the prior security and data-integrity findings.
- The only untracked audit output is under [docs/senda-4.0/audits/full-audit/](/workspaces/Senda-4.0/docs/senda-4.0/audits/full-audit/); no tracked application file was changed.

The remaining external blockers are real partner, bank/wallet, biller and school evidence; named customer validation; live settlement and allocation; and legal/compliance review. These prevent pilot or production readiness, but they are not omitted internal repository evidence.
