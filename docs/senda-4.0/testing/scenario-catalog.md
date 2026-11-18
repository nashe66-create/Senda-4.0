# Scenario catalog — locked Senda 4.0 decisions

**Authority:** Project preferences + [how-it-works](../product/how-it-works.md) + [lock-brief](../research/lock-brief.md).  
**Structured cases:** [cases/all-cases.yaml](cases/all-cases.yaml).  
**Coverage:** [coverage-map.md](coverage-map.md).

Each scenario has: **id**, **domain**, **locks**, **type** (happy | edge | abuse | ops | partner | dispute | policy), **setup**, **action**, **expect**, **pass/fail**.

Legend for **expect outcome**: `allow` | `reject` | `proven` | `needs_reconcile` | `deferred` | `docs_ok` | `policy_ok`.

---

## A. Dogfood UI (Lock #1)

| ID | Type | Setup | Action | Expect | Pass if |
| --- | --- | --- | --- | --- | --- |
| DF-01 | happy | Verified ZW school, open Link, open Obligation | Ops runs dogfood validate→instruct→confirm→proof with **no** live MTO | allow → proven | Full loop completes; proof JSON available |
| DF-02 | edge | Same as DF-01 | Dogfood Attempt uses same domain objects as Connect | policy_ok | Attempt/Instruction/Confirmation/Proof share Connect schema |
| DF-03 | policy | Product surfaces inventory | Inspect dogfood scope | policy_ok | Thin UI only: instruct/confirm/proof — no consumer remittance rates/FX UI |
| DF-04 | abuse | Dogfood session | Attempt to make Senda collect/FX/payout (`senda_settles`) via dogfood | reject | Dogfood cannot become adaptor-as-payer |
| DF-05 | edge | Partner sandbox also available | Prefer dogfood for cold-start when no named partner | allow | Build not blocked on live partner (#4) |

---

## B. Links — open student+school; verify on confirm (Lock #2)

| ID | Type | Setup | Action | Expect | Pass if |
| --- | --- | --- | --- | --- | --- |
| LK-01 | happy | Beneficiary + school Link (open) | Any abroad payer/partner validates with `link_code` + obligation | allow | Validate succeeds without payer binding |
| LK-02 | happy | Two different payers, same Link | Both validate/instruct sequentially (or different terms) | allow | Open Link; not payer-bound day one |
| LK-03 | happy | Instructed Attempt | Confirm with matching ref + amount + currency | proven | Verification on confirm required and passes |
| LK-04 | edge | Valid Link, wrong obligation_id | Validate | reject | Obligation must belong to Link/beneficiary |
| LK-05 | edge | Valid Obligation, unknown link_code | Validate | reject | Link must resolve |
| LK-06 | abuse | Confirm without prior Instruction | Confirm | reject | No proof without instruct→ref |
| LK-07 | edge | Confirm with wrong amount | Confirm | needs_reconcile | Verification fails exact match → recon queue |
| LK-08 | edge | Confirm with wrong currency | Confirm | needs_reconcile | Same |
| LK-09 | edge | Confirm with wrong customer_reference | Confirm | needs_reconcile | Ref check fails |
| LK-10 | policy | Product asks for payer-bound Link day one | Design review | reject | Lock #2 = open first; bind later |

---

## C. Pricing deferred (Lock #3)

| ID | Type | Setup | Action | Expect | Pass if |
| --- | --- | --- | --- | --- | --- |
| PR-01 | policy | Connect MVP | Charge partner a Connect fee | reject / deferred | No pricing product in MVP |
| PR-02 | happy | Connect usage events | Instrument validate/instruct/confirm counts | policy_ok | Usage instrumented without billing |
| PR-03 | edge | School Biller | Invoice school for Links | deferred | Pricing deferred for schools too |

---

## D. Design-partner outreach parallel (Lock #4)

| ID | Type | Setup | Action | Expect | Pass if |
| --- | --- | --- | --- | --- | --- |
| DP-01 | policy | No named MTO | Continue M1–M3 build | allow | Build not gated on named partner |
| DP-02 | happy | Dogfood + sandbox key | Run happy path without live Mukuru | allow | Cold-start works |
| DP-03 | ops | Outreach tracker | Parallel shortlist Mukuru/Remitly/WR/Vybe-class | policy_ok | Outreach tracked separately; none required named |

---

## E. Live pilot ZW only; corridors enums-only (Lock #5 + Wedge)

| ID | Type | Setup | Action | Expect | Pass if |
| --- | --- | --- | --- | --- | --- |
| CR-01 | happy | Institution country=ZW | Live KYB + verified SettleDestination | allow | ZW pilot path open |
| CR-02 | edge | Institution country=NG | Attempt live KYB / live Connect instruct | reject | Enums-only; no live NG pilot |
| CR-03 | edge | Corridor enum ZA / other | Live instruct | reject | Non-ZW live blocked |
| CR-04 | policy | Vertical = medical / funeral / utilities | First-wedge scope | reject | School fees first |
| CR-05 | happy | Obligation currency=USD, UK→ZW | Validate/instruct | allow | Wedge currency USD |
| CR-06 | edge | Obligation currency=ZiG forced by school | Instruct | edge / later | Prefer USD; ZiG only if named pilot forces (flag, don’t reopen #10) |

---

## F. Docs path (Locks #6–#8)

| ID | Type | Setup | Action | Expect | Pass if |
| --- | --- | --- | --- | --- | --- |
| DOC-01 | happy | Repo main | Canonical docs under `docs/senda-4.0/` | docs_ok | Pack present on main |
| DOC-02 | happy | Legacy stubs | `docs/senda-4-work-plan.md` etc. redirect | docs_ok | Stubs point at pack |
| DOC-03 | policy | Propose alternate docs root | Relocate pack | reject | Path lock = `docs/senda-4.0/` |
| DOC-04 | happy | This test pack | Lives under `docs/senda-4.0/testing/` | docs_ok | Follows path lock |

---

## G. Tech stack constraints (Lock #9)

| ID | Type | Setup | Action | Expect | Pass if |
| --- | --- | --- | --- | --- | --- |
| ST-01 | policy | Scaffold / architecture doc | Stack = Next.js App Router + TypeScript + Postgres | policy_ok | Matches lock text |
| ST-02 | happy | Connect caller | Auth with partner API key | allow | Partner keys, not end-user OAuth |
| ST-03 | happy | School user | Auth with school/ops identity | allow | Separate from partner keys |
| ST-04 | happy | Proven Attempt | Store Proof in S3-compatible object store | allow | Blob not only in Postgres |
| ST-05 | abuse | Proposal: neural-net matching day one | Add NN recon | reject | No NN day one |
| ST-06 | abuse | Proposal: ERP connector day one | Live ZivoFees/Makronexus pull | reject | No ERP day one; templates + exceptions |
| ST-07 | abuse | Proposal: PSP-core / multi-PSP orchestrator | Build payout engine | reject | No PSP-core; `mto_settles` |
| ST-08 | policy | Biller vs school ERP | Biller beside school systems | policy_ok | Does not replace school ledger |
| ST-09 | edge | Split Nest+React vs Next monolith | Architecture choice | policy_ok | Prefer locked Next+TS+Postgres; alternatives reopen #9 |

---

## H. SettleDestination + Connect money path (Lock #10)

| ID | Type | Setup | Action | Expect | Pass if |
| --- | --- | --- | --- | --- | --- |
| SD-01 | happy | KYB school USD bank nostro/FCA | Verify SettleDestination `bank_usd` | allow | Accepted Connect destination |
| SD-02 | happy | KYB school-owned EcoCash merchant/wallet | Verify `ecocash` | allow | Accepted Connect destination |
| SD-03 | abuse | SettleDestination type=cash_pickup | Save for Connect | reject | Cash out of Connect |
| SD-04 | abuse | EcoCash MSISDN owned by relative (not school) | Save as school destination | reject | Relative wallets rejected |
| SD-05 | abuse | Paynow merchant ID as Connect destination | Instruct MTO to Paynow | reject | Paynow = school-local only |
| SD-06 | abuse | ZIPIT school-code as Connect destination | Instruct MTO to ZIPIT | reject | ZIPIT = school-local only |
| SD-07 | policy | School uses Paynow for local parents | Document as local rail; not Connect | policy_ok | Local rail allowed off Connect |
| SD-08 | happy | bank_usd + partner can hit bank | validate→instruct→confirm→proof | proven | Full #10 model |
| SD-09 | happy | ecocash + partner can hit EcoCash | validate→instruct→confirm→proof | proven | Full #10 model |
| SD-10 | edge | Partner cannot hit school’s only destination type | Instruct | reject | Partner-capability-aware |
| SD-11 | edge | Unverified SettleDestination | Instruct | reject | KYB verify required before freeze |
| SD-12 | edge | Destination changes after instruct | Confirm against frozen snapshot | needs_reconcile or proven on snapshot | Instruction freezes destination |
| SD-13 | policy | Currency for UK→ZW Obligation | Create Obligation | allow only USD (wedge default) | USD lock |

---

## I. Freshness — templates, fetch-at-pay, CSV (Freshness prefs)

| ID | Type | Setup | Action | Expect | Pass if |
| --- | --- | --- | --- | --- | --- |
| FR-01 | happy | Grade/class fee template | Bulk-generate Obligations for roster | allow | Templates → Obligations |
| FR-02 | happy | Open Obligation | Fetch Obligation at pay/validate time | allow | Fetch-at-pay returns current status |
| FR-03 | policy | Ops asks for daily 600-row CSV edits | Ongoing freshness process | reject | CSV = onboarding only |
| FR-04 | edge | Obligation past due-window / stale flag | Validate/instruct | reject or flag | Stale Obligation blocked or flagged per SLA |
| FR-05 | edge | No open Obligation for student/term | Instruct | reject | No Obligation → no instructions |
| FR-06 | happy | Per-student amount override in Biller | Bulk template + exception | allow | Exceptions without full CSV rewrite |
| FR-07 | happy | Attempt becomes proven | Ledger/Obligation status updates | allow | Auto update from proven pays |
| FR-08 | ops | School unmaintained (stale roster) | Weekly hygiene | reject from live Connect | Remove unmaintained schools |
| FR-09 | edge | Term rollover without new plan | Validate Term N+1 | reject | New term needs new Obligations |

---

## J. Local payers deferred (Scope)

| ID | Type | Setup | Action | Expect | Pass if |
| --- | --- | --- | --- | --- | --- |
| LP-01 | policy | Local ZW parent wants Connect depth | MVP local-payer product | deferred | Abroad UK→ZW first |
| LP-02 | edge | Local payment against Obligation | Manual external payment mark (ops/school) | allow (manual) | Optional write; not full local product |
| LP-03 | edge | Skip logging local pays in MVP term | Freshness still via term refresh | policy_ok | Term refresh acceptable per how-it-works |

---

## K. Attempt / Instruction / Confirmation / Proof / Recon disputes

| ID | Type | Setup | Action | Expect | Pass if |
| --- | --- | --- | --- | --- | --- |
| RC-01 | happy | Instructed Attempt, correct settle | Partner confirm match | proven | Proof issued |
| RC-02 | dispute | Amount mismatch on confirm | Confirm | needs_reconcile | Ops queue |
| RC-03 | dispute | Currency mismatch | Confirm | needs_reconcile | Ops queue |
| RC-04 | dispute | Ref mismatch | Confirm | needs_reconcile | Ops queue |
| RC-05 | dispute | **MTO fails to deliver** (no settle, no confirm) | Wait past settle window | edge: stuck instructed / cancel path | No false proven; ops visibility |
| RC-06 | dispute | **False confirm** (partner posts paid) | Confirm without real credit | needs_reconcile when school disputes | Must not silent-proven forever |
| RC-07 | dispute | **School unpaid** after partner confirm | School marks unpaid / dispute | needs_reconcile | Dispute path exists |
| RC-08 | dispute | Settled to **wrong destination** | Confirm / school report | needs_reconcile | Destination check or dispute |
| RC-09 | edge | Duplicate confirm same partner_payment_id | Confirm again | idempotent proven | No double-proof side effects |
| RC-10 | edge | Partial amount paid | Confirm partial | needs_reconcile (MVP exact match) | Exact match MVP |
| RC-11 | edge | Idempotent instruct same key | Instructions twice | same attempt/ref | Idempotency |
| RC-12 | abuse | Same idempotency_key, different amount | Instruct | reject | Key conflict |
| RC-13 | happy | Proven Attempt | Fetch Proof JSON (partner + Biller) | allow | Shared proof artifact |
| RC-14 | edge | needs_reconcile Attempt | Request Proof as proven | reject | Proof only when proven |

---

## L. Partner capability mismatches

| ID | Type | Setup | Action | Expect | Pass if |
| --- | --- | --- | --- | --- | --- |
| PC-01 | partner | Partner bank_usd only; school ecocash only | Instruct | reject | Clear capability error |
| PC-02 | partner | Partner both; school bank_usd | Instruct | allow | Happy |
| PC-03 | partner | Partner has no ZW payout | Instruct | reject | Corridor capability |
| PC-04 | partner | Partner statement shows partner ref not Senda ref | Recon | policy_ok | Dual recon: confirm payload authoritative |
| PC-05 | partner | Partner cannot pass custom bursar string | Instruct still issues Senda ref | allow | Document; confirm payload carries Senda ref |
| PC-06 | ops | PayAngel-class no ZW | Treat as non-pilot demand | deferred | Enums/later |

---

## M. Abuse / fraud extras

| ID | Type | Setup | Action | Expect | Pass if |
| --- | --- | --- | --- | --- | --- |
| AB-01 | abuse | Stolen link_code | Validate without valid Obligation context | reject or limited | Still needs obligation + confirm verification |
| AB-02 | abuse | Double-pay same open Obligation | Second instruct while first in-flight | edge | One open attempt policy or both tracked; no silent double proven |
| AB-03 | abuse | Tamper frozen destination client-side | Confirm altered destination | needs_reconcile / reject | Server snapshot wins |
| AB-04 | abuse | Staff personal EcoCash as “school” wallet | KYB verify | reject | Ownership proof required |
| AB-05 | abuse | Partner confirms for another partner’s attempt | Confirm | reject | partner_id must own Attempt |

---

## N. Ops / KYB failures

| ID | Type | Setup | Action | Expect | Pass if |
| --- | --- | --- | --- | --- | --- |
| OP-01 | ops | Incomplete KYB | Enable live Connect | reject | Gate |
| OP-02 | ops | Account title ≠ legal name for bank | Verify bank_usd | reject or warn | Exact account title capture |
| OP-03 | ops | CSV onboarding import | Import ≥20 beneficiaries | allow | Cold-start exit |
| OP-04 | ops | Fee plan assign after CSV | Generate Obligations | allow | Onboarding path |
| OP-05 | ops | Change settle destination | Re-verify before new instructs | allow after verify | Versioned destinations |

---

## Domain-object index

| Domain object | Scenario IDs |
| --- | --- |
| Institution / KYB | CR-01..03, OP-01..02, OP-05, FR-08 |
| SettleDestination | SD-01..13, PC-01..03, AB-04 |
| Beneficiary / Link | LK-01..10, AB-01, OP-03 |
| Obligation | FR-01..09, LK-04, CR-05..06, LP-02 |
| Attempt / Instruction | DF-01..02, SD-08..12, RC-05, RC-11..12, AB-02..03 |
| Confirmation | LK-03, LK-06..09, RC-01..10, RC-06..07, AB-05 |
| Proof | DF-01, RC-13..14, ST-04 |
| Surfaces (Dogfood/Connect/Biller) | DF-*, ST-02..03, ST-08, DP-02 |
| Policy / docs / stack | PR-*, DP-*, DOC-*, ST-*, LP-*, CR-04 |

---

## Explicit non-scenarios (out of pack scope)

Do **not** write product tests that assume: consumer rate competition, `senda_settles` as core, live Nigeria KYB, ERP day one, PSP-core, open marketplace, medical/funeral first wedge, or reopening locked #1–#10.
