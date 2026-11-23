# Product and Workflow Audit

**Baseline:** `4bf9ed5dbe46e454baaa176f0c62df634230e173`  
**Scope:** partner, biller, customer/beneficiary and operations workflow.

## Workflow classes

| Stage | Implementation | Classification | Gap |
|---|---|---|---|
| Partner onboarding | Seeded fixture partner API key only | Demo | No partner agreement, KYC, key provisioning, rotation or corridor approval. |
| Biller onboarding | Thin verified/pending checklist and seeded institution | Demo/partial | No assisted/self-service KYB, document review, representative verification or ownership evidence. |
| Payout destination | Bank/EcoCash rows with `verified` flag | Demo/partial | No approval evidence, account verification, change workflow or effective history. |
| Roster | Beneficiaries and links seeded/read-only | Demo/partial | No CSV/XLSX import, upsert, joins/leaves or correction. |
| Fee schedule | FeeTemplate and seeded Term 1 obligations | Demo/partial | No bulk generation UI/transaction, version history or exception approval. |
| Partner validate | API checks link/obligation/status/destination/capability | Implemented sandbox | No fresh external obligation feed or independent data authority. |
| Partner instruct | API creates frozen instruction and attempt | Implemented sandbox | Duplicate-active-attempt and partner-scoping bugs. |
| Settlement | Partner external process; no integration | Not implemented | No live rail, webhook or signed callback. |
| Partner confirmation | Reference/amount/currency callback match | Demo attestation | Does not prove bank credit or school allocation. |
| Reconciliation | mismatch becomes needs_reconcile | Partial | No queue ownership, SLA, evidence, dispute or resolution workflow. |
| Biller allocation | none | Not implemented | No credited/allocated state, allocation evidence or manual correction. |
| Proof | Local JSON file plus DB payload | Demo stub | Not durable, signed or independently verifiable. |

## Partner workflow

The partner authenticates with an API key and calls validate/instruct/confirm. Validate has corridor, institution, link, obligation, stale and destination checks. Instruct freezes destination details and creates a customer reference. Confirm is an exact match against instruct data.

Evidence status: `instructed` is Senda-issued payment instruction; `confirmed` is partner callback; `proven` currently combines a partner-supplied match with a JSON artifact. It does not prove receipt or allocation.

## Biller workflow

The Biller dashboard lists:

- organisation/KYB/live status;
- bank/EcoCash payout checks;
- open obligations;
- beneficiary roster;
- attempts and proof download;
- needs-a-check queue.

It is read-only for roster and obligations. There is no confirmed allocation UI, local-payment mark, term refresh, CSV import, destination-change approval or exception resolution. The page text itself says CSV import is later and the roster is read-only.

## Customer/beneficiary workflow

The beneficiary is represented as a student, pay code and obligation. No customer-facing app is implemented. The payer receives the partner-provided instruction and pays; Senda has no independent receipt or allocation confirmation.

## Stale dues and destination changes

The branch-only onboarding decision brief classifies double pay/local payment race as a critical failure mode and recommends:

- local-paid mark or term refresh;
- one active attempt;
- stale/not-open rejection;
- overpay/partial handling;
- frozen destination for in-flight instructions.

The application has stale validation and frozen JSON, but no:

- paid-locally mark;
- obligation version history;
- destination-change approval;
- in-flight warning;
- late-confirmation protection;
- allocation/correction history.

## Stage trace

The recommended evidence lifecycle is:

1. **validated** — amount and destination were current and allowable;
2. **instructed** — instruction issued to a partner;
3. **partner_confirmed** — partner attests execution;
4. **credited** — independent destination receipt evidence matches;
5. **allocated** — biller confirms customer/obligation allocation;
6. **needs_reconcile** — mismatch/dispute/evidence missing;
7. **cancelled/reversed** — explicit terminal state with reason and audit trail.

Current state values do not implement this full lifecycle.

## Branch-only doc impact

The onboarding scenarios confirm that ops-assisted onboarding and thin Biller behavior are the intended pilot. They also explicitly warn that partner attestation is not bank credit. Therefore the source implementation is behind the stated product doctrine in freshness, reconciliation and evidence.

## Findings

| ID | Severity | Status | Finding |
|---|---|---|---|
| PROD-01 | High/P1 | CONFIRMED | Evidence semantics and duplicate instruction integrity prevent a real pilot. |
| PROD-02 | High/P1 | CONFIRMED | No independent school receipt or allocation workflow. |
| PROD-03 | High/P1 | CONFIRMED | No local-paid or stale-bill resolution in executable code. |
| PROD-04 | Medium/P2 | CONFIRMED | No obligation version history, fee override audit or destination-change history. |
| PROD-05 | Medium/P2 | CONFIRMED | No exception owner/SLA/evidence-resolution workflow. |
| PROD-06 | Medium/P2 | CONFIRMED | No CSV/XLSX, KYB, representative, payout ownership or bulk obligation process. |
| PROD-07 | Medium/P2 | CONFIRMED | No real partner, bank, wallet or school integration. |
| PROD-08 | Low/P3 | SUSPECTED | Commercial assumptions remain unvalidated: MTO willingness, school willingness and proof value. |

## Pilot acceptance

A real pilot is blocked until:

- P1 security/integrity findings pass tests;
- one real partner, biller and destination are verified;
- credit evidence and biller allocation are distinguishable;
- stale/local pay race is handled;
- reversals/disputes retain traceability;
- all secrets and public demo routes are scoped.
