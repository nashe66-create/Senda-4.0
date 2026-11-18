# Senda 4.0 — How the system works (working product spec)

**Status:** Working draft from locked plan decisions (2026-11-18).  
**Stack (#9):** **LOCKED** — Next.js App Router + TypeScript + Postgres; partner API keys + school/ops auth; S3-compatible proofs; Biller beside school systems; no NN / no ERP / no PSP-core day one.  
**Settle methods (#10):** **LOCKED** — `bank_usd` + school-owned `ecocash`; Paynow/ZIPIT school-local only; cash/relative wallets out of Connect; MTOs settle with Senda validate→ref→confirm.  
**Corridor:** UK → Zimbabwe private school fees. Local ZW payer flow deferred for MVP.

## One sentence

Senda 4.0 proves the right institution and beneficiary got paid for the right obligation — partners move the money; Senda owns Links, refs, validation, recon, and proof.

## Surfaces

| Surface | Who | Job |
| --- | --- | --- |
| Connect | MTOs / purpose apps | Validate → instructions + ref → confirm → proof |
| Biller | Schools | KYB, students/Links, payment visibility, proof (beside existing school finance tools) |
| Dogfood UI | Founder / ops | Thin UI to run the loop without a live partner |

## Domain objects (conceptual)

Institution → SettleDestination → Beneficiary → Link → Obligation → Attempt → Instruction (ref + frozen destination) → Confirmation → Proof

## Abroad payer happy path (MVP)

1. School completes KYB; settle destination verified (school’s real bank / EcoCash — not a Senda wallet).
2. Students imported; **open Links** (student + school; not payer-bound day one).
3. Payer or partner validates obligation; Senda issues pay instructions + unique `customer_reference`.
4. Partner settles to the school destination with that ref (`mto_settles`). Senda does not collect/FX/payout as the core product.
5. Confirmation ingested and verified: ref + amount + currency (+ destination snapshot).
6. Recon → `proven` or `needs_reconcile`; proof artifact for partner and school.

## Locked decisions

1. Dogfood UI: yes, minimal  
2. Links: open student+school; verification required on confirm  
3. Pricing: defer; instrument usage  
4. Design partner: outreach parallel; none named  
5. Live pilot: ZW only; other corridors enums-only  
6. Docs PR merge: done  
7. Port full docs pack into Senda-4.0: yes  
8. Docs path: `docs/senda-4.0/…`  
9. **Tech stack LOCKED:** Next.js App Router + TypeScript + Postgres; partner API keys + school/ops auth; S3-compatible object store for proofs; Biller beside school systems; no NN / no ERP / no PSP-core day one  
10. **ZW settle methods LOCKED:** Pilot Connect SettleDestination types = `bank_usd` (school USD nostro/FCA) + school-owned `ecocash` (prefer merchant/institutional wallet); out of Connect: cash pickup, relative wallets, Paynow merchant IDs, ZIPIT school-codes (school-local / later only); USD Obligations for UK→ZW; model = KYB verifies school destination → Connect validate Obligation → instruct with frozen destination + unique ref → MTO confirm → proof. Partner API outreach is ops sequencing, not a reopen of this lock.  
- Local payer verification: **deferred** for MVP (recon model can extend later)  
- No neural net day-one; moat is allowlist + Links + proof  

## Explicit non-goals (near term)

Consumer remittance competition on rates/speed; `senda_settles` / adaptor-as-payer; replacing school ERP/ledger; open marketplace; live Nigeria pilot; local-payer product depth in MVP; PSP-core / payment orchestrator day one.

## Example: Mukuru payer journey (abroad)

1. School already on Biller (KYB, settle destination, student Links). Mukuru integrated on Connect.
2. Payer opens Mukuru → ZW school-fee / bill-pay flow (Mukuru UI).
3. Selects school + student (Link/code); Mukuru → Connect validate.
4. Senda returns pay instructions + unique ref + frozen destination.
5. Mukuru collects, converts, settles to school with that ref (`mto_settles`).
6. Mukuru posts confirmation; Senda recon (ref + amount + currency) → proven or needs_reconcile.
7. Proof available to Mukuru and school (Biller). Payer stays in Mukuru; does not use Senda app.

## School data: start vs ongoing

**Start:** KYB identity; verified settle destination; student CSV → Links; fee plan (term/amount/currency/due); assign students → Obligations.

**Ongoing:** student join/leave; new term fee plan + assignments; per-student amount overrides; settle destination only if it changes. No continuous full-ledger sync.

## Connect payloads (draft — Mukuru-shaped)

Validate: partner_id, link_code, obligation_id, amount, payer hint → ok + summaries.  
Instructions: same + idempotency_key → attempt_id, customer_reference, destination snapshot.  
Confirm: attempt_id, customer_reference, amount, partner_payment_id, settled_at → proven | needs_reconcile.  
Auth: partner API key. Field names not frozen until docs pack / API contract lands.

## Ledger clarification

Senda keeps a **fees-due ledger** (Fee plans + per-student Obligations + payment status). That is how we know Term 3 due. We do **not** keep the school’s full accounting/ERP ledger. If no Obligation exists for Term 3, Connect cannot know that student’s Term 3 due.

## Lifecycle updates (who writes)

Student leave / roster change: school Biller or ops CSV.  
Local/off-platform payment against an Obligation: school/ops manual external payment (MVP); Mukuru only posts what it settles via Connect. Without those writes, due balances drift.

## MTO selling point

Accurate Obligations (allowlisted due for the right beneficiary) + instructions/ref + proof. Medical/funeral later reuse the same pattern; school-fee wedge must work first.

## Data freshness without ERP link

Obligation-required Connect pays; Biller is dues source of truth; stale Obligation flags + pilot ops SLA; proven payments update ledger automatically; ERP/scheduled import is phase 2.

## Post-setup update process

Auto: proven Connect payments adjust Obligations; needs_reconcile → ops.  
School Biller: roster changes; new-term plans/assignments; amount overrides; external payments; settle-destination changes.  
Enforce: no open Obligation → no instructions; stale due-window flags.  
Pilot ops: weekly hygiene check; remove from live Connect if unmaintained.

## Low-burden school freshness (defensible)

School work is rare/bulk: term CSV (fee plan assign + roster upsert), rare settle-destination re-verify. System: obligation-required Connect, auto ledger from proven pays, versioned destinations. MVP: do not require daily local-payment logging; term refresh acceptable. Ops helps first terms.

## Research note: freshness without painful CSV (2026-11-18)

Industry: pay-time pull from ERP (Jodo); SIS connectors / daily files (Flywire, EFUNDS); class fee templates + bulk invoice generate (SchoolEasy, ProEMS, ZivoFees); payments auto-update ledger. CSV = onboarding, not ongoing.

Senda target: grade/class fee templates → bulk Obligation generate; Biller exceptions only; obligation-required + pay-time status check; ERP/ZW fee-system pull later. Not ongoing 600-row CSV edits.

## Lessons from Bharat Connect / BBPS (working note)

Full study: [research/bbps-india.md](../research/bbps-india.md).

Steal: fetch-then-pay; student unique id; one biller onboard; demand from ledger or file; bind fetch→pay refs; biller-level partial-pay rules; directory alone ≠ volume.

Don’t copy: settlement guarantee / clearing-house role; domestic UPI as our wedge.

Senda shape: BOU/aggregator for purpose Obligations; MTO acts like COU; we instruct + proof, partner settles. Freshness = fetch Obligation at pay time.
