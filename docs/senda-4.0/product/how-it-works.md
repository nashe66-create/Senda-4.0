# Senda 4.0 — How the system works (working product spec)

**Status:** Working draft from locked plan decisions (2026-11-18).  
**Stack (#9):** **LOCKED** — Next.js App Router + TypeScript + Postgres; partner API keys + school/ops auth; S3-compatible proofs; Biller beside school systems; no NN / no ERP / no PSP-core day one.  
**Settle methods (#10):** **LOCKED** — `bank_usd` + school-owned `ecocash`; Paynow/ZIPIT school-local only; cash/relative wallets out of Connect; remittance partners settle with Senda validate→ref→confirm.  
**Corridor:** UK → Zimbabwe private school fees (**first wedge example** — not the only biller). Local ZW payer flow deferred for MVP.

**Language:** User-facing copy prefers pay code, amount due, payment reference, confirmed / needs a check, retry key. System names (`Obligation`, `proven`, `idempotency_key`, …) stay in API/DB with a gloss. Full map: [connect-concepts §0](./connect-concepts.md).

## One sentence

Senda 4.0 proves the right organisation and person got paid for the right **amount due** — partners move the money; Senda owns pay codes (Links), payment references, validation, recon, and payment proof.

## Surfaces

| Surface | Who | Job |
| --- | --- | --- |
| Connect | Remittance / purpose-pay partners | Validate → pay instructions + payment reference → confirm → proof |
| Biller | Organisations (first wedge: schools) | Organisation checks (KYB), roster/pay codes, payment visibility, proof (beside existing finance tools) |
| Test loop (dogfood) | Founder / ops | Thin UI to run the loop without a live partner; **test confirmation ≠ money received** |

## Domain objects (conceptual)

Organisation (Institution) → Payout account (SettleDestination) → Who it’s for (Beneficiary) → Pay code (Link) → Amount due (Obligation) → Payment (Attempt) → Pay instructions (Instruction: ref + frozen destination) → Partner confirmation → Payment proof

## Abroad payer happy path (MVP)

1. Organisation completes checks; payout account verified (their real bank / EcoCash — not a Senda wallet).
2. People imported; **open pay codes** (person + organisation; not payer-bound day one).
3. Payer or partner validates an amount due; Senda issues pay instructions + unique **payment reference** (`customer_reference`).
4. Partner settles to the organisation payout account with that ref (`mto_settles`). Senda does not collect/FX/payout as the core product.
5. Confirmation ingested and verified: payment reference + amount + currency (+ destination snapshot).
6. Recon → **confirmed** (`proven`) or **needs a check** (`needs_reconcile`); payment proof for partner and organisation.

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
10. **ZW settle methods LOCKED:** Pilot Connect SettleDestination types = `bank_usd` (school USD nostro/FCA) + school-owned `ecocash` (prefer merchant/institutional wallet); out of Connect: cash pickup, relative wallets, Paynow merchant IDs, ZIPIT school-codes (school-local / later only); USD amounts due for UK→ZW; model = KYB verifies school destination → Connect validate amount due → instruct with frozen destination + unique ref → partner confirm → proof. Partner API outreach is ops sequencing, not a reopen of this lock.  
- Local payer verification: **deferred** for MVP (recon model can extend later)  
- No neural net day-one; moat is allowlist + pay codes + proof  

## Explicit non-goals (near term)

Consumer remittance competition on rates/speed; `senda_settles` / adaptor-as-payer; replacing organisation ERP/ledger; open marketplace; live Nigeria pilot; local-payer product depth in MVP; PSP-core / payment orchestrator day one.

## Example: partner payer journey (abroad)

*School-fees reading of the first wedge — same path for other billers later. Named remittance brands in research are examples only; product identity is generic “partner”.*

1. Organisation already on Biller (checks, payout account, pay codes). Partner integrated on Connect.
2. Payer opens the **partner** app → purpose / bill-pay flow (partner UI).
3. Selects organisation + person (pay code); partner → Connect validate.
4. Senda returns pay instructions + unique payment reference + frozen payout account.
5. Partner collects, converts, settles to the organisation with that ref (`mto_settles`).
6. Partner posts confirmation; Senda recon (ref + amount + currency) → confirmed or needs a check.
7. Payment proof available to partner and organisation (Biller). Payer stays in the partner app; does not use a Senda consumer app.

## Organisation data: start vs ongoing

**Start:** Organisation checks; verified payout account; roster CSV → pay codes; fee/bill plan (period/amount/currency/due); assign people → amounts due.

**Ongoing:** join/leave; new-period bill plan + assignments; per-person amount overrides; payout account only if it changes. No continuous full-ledger sync.

## Connect payloads (draft)

Validate: partner_id, link_code (pay code), obligation_id (amount due), amount, payer hint → ok + summaries.  
Instructions: same + **retry key** (`idempotency_key`) → attempt_id, customer_reference (payment reference), destination snapshot. Same retry key is **safe to retry** — you get the same pay instructions back, not a second payment.  
Confirm: attempt_id, customer_reference, amount, partner_payment_id, settled_at → confirmed | needs a check.  
Auth: partner API key. Field names not frozen until docs pack / API contract lands.

**Deeper model:** [Connect concepts](./connect-concepts.md) — plain-language wording map + purpose, inputs, rules, failure codes, and M1 stub-vs-real (partners/billers generic; school fees = first wedge example).

## Ledger clarification

Senda keeps a **fees/amounts-due ledger** (bill plans + per-person amounts due + payment status). That is how we know a period is due. We do **not** keep the organisation’s full accounting/ERP ledger. If no amount due exists for a period, Connect cannot know that person’s due for that period.

## Lifecycle updates (who writes)

Roster change: Biller or ops CSV.  
Local/off-platform payment against an amount due: organisation/ops manual external payment (MVP); Connect partners only post what they settle via Connect. Without those writes, due balances drift.

## Partner selling point

Accurate amounts due (allowlisted bill for the right person) + pay instructions / payment reference + proof. Medical/funeral/utilities later reuse the same pattern; the school-fee wedge must work first.

## Data freshness without ERP link

Amount-due–required Connect pays; Biller is dues source of truth; out-of-date flags + pilot ops SLA; confirmed payments update the ledger automatically; ERP/scheduled import is phase 2.

## Post-setup update process

Auto: confirmed Connect payments adjust amounts due; needs a check → ops.  
Biller: roster changes; new-period plans/assignments; amount overrides; external payments; payout-account changes.  
Enforce: no open amount due → no pay instructions; out-of-date due-window flags.  
Pilot ops: weekly hygiene check; remove from live Connect if unmaintained.

## Low-burden organisation freshness (defensible)

Organisation work is rare/bulk: period CSV (fee plan assign + roster upsert), rare payout-account re-verify. System: amount-due–required Connect, auto ledger from confirmed pays, versioned destinations. MVP: do not require daily local-payment logging; period refresh acceptable. Ops helps first periods.

## Research note: freshness without painful CSV (2026-11-18)

Industry: pay-time pull from ERP (Jodo); SIS connectors / daily files (Flywire, EFUNDS); class fee templates + bulk invoice generate (SchoolEasy, ProEMS, ZivoFees); payments auto-update ledger. CSV = onboarding, not ongoing.

Senda target: grade/class fee templates → bulk amount-due generate; Biller exceptions only; amount-due–required + pay-time status check; ERP/ZW fee-system pull later. Not ongoing 600-row CSV edits.

## Lessons from Bharat Connect / BBPS (working note)

Full study: [research/bbps-india.md](../research/bbps-india.md).

Steal: fetch-then-pay; person unique id; one biller onboard; demand from ledger or file; bind fetch→pay refs; biller-level partial-pay rules; directory alone ≠ volume.

Don’t copy: settlement guarantee / clearing-house role; domestic UPI as our wedge.

Senda shape: BOU/aggregator for purpose amounts due; remittance partner acts like COU; we instruct + proof, partner settles. Freshness = fetch amount due at pay time.
