# Lock brief — wedge, #9, #10

**Date:** 2026-11-18  
**Sources:** [Demand](demand-mto-diaspora.md) · [Supply](supply-zw-schools.md) · [Rails & stack](rails-and-stack.md) · [Wedge](wedge-comparison.md)  
**Method:** Public research only; founder outreach still required where flagged.

---

## Decision status

| # | Decision | Status | Text |
| --- | --- | --- | --- |
| Wedge | First live wedge | **LOCKED** (preferences / corridor) | **UK → ZW private school fees** (not medical / funeral / utilities first) |
| Freshness | How dues stay current | **Locked** (product prefs) | Grade/class **fee templates → bulk Obligations**; Biller exceptions; **fetch-at-pay**; CSV = onboarding only; no ERP day one |
| **#9** | Tech stack | **LOCKED** (2026-11-18) | **Next.js (App Router) + TypeScript + Postgres**; partner API keys + school/ops auth; S3-compatible object store for proofs; Biller beside school systems; **no NN / no ERP / no PSP-core day one** |
| **#10** | ZW settle methods | **Proposed** (pending — preferences) | Research recommends pilot: **`bank_usd` + school-owned `ecocash`**; reject cash/relative wallets for Connect; Paynow/ZIPIT = school-local only |

---

## Why this fits together

- **Demand:** UK→ZW remittances are large; education is a major purpose; classic MTOs lack fetchable school-fee SKUs — Connect gap is validate→instruct→proof, not FX.  
- **Supply:** ZW schools already think in term templates + bulk invoice (Excel/ZivoFees/Makronexus); daily CSV is the wrong habit.  
- **Rails:** MTOs can hit school **USD bank** and **EcoCash**; Paynow/ZIPIT are local. EcoCash Diaspora Wallet is a bypass — win on Obligation + proof.  
- **Wedge:** Schools beat medical (messy dues) and funeral (IPEC/incumbents); utilities tie on score but weak Link moat.

---

## #9 — LOCKED stack text

**Lock:** Next.js App Router + TypeScript + Postgres; partner API keys + school/ops auth; S3-compatible object store for proofs; Biller beside school systems; no neural net / no ERP connectors / no PSP-core day one.

Confidence from research: High (~0.85). See [rails-and-stack.md](rails-and-stack.md).

---

## #10 — Proposed (not locked)

Research recommendation (do **not** treat as locked until founder confirms):

1. **`bank_usd`** — school nostro/FCA (default preferred for term-size fees)  
2. **`ecocash`** — school-owned EcoCash (prefer merchant/institutional wallet)

Out of pilot Connect destinations: cash pickup, personal relative wallets, Paynow merchant IDs, ZIPIT school codes (document as school-local / future enums only).

---

## 90-day build (with #9 locked)

Domain + KYB + Links + fee templates/Obligations → instruct/ref → confirm/recon → proof JSON → Connect sandbox → thin Biller → dogfood UI.  
Later: ERP pull, webhooks, PDF, insurer/utility adapters, `senda_settles`.

---

## Still need founder outreach (does not block #9)

1. Mukuru/Remitly/WR: institutional bank + EcoCash merchant payout; custom ref pass-through  
2. 3–5 bursars: will they run templates + exceptions for diaspora-linked students?  
3. Named 5–10 pilot schools  
4. Optional: Vybe-class ZW appetite  
5. **Lock or edit #10** settle methods

---

## Ask (remaining)

Reply **lock** (or edit) for: **#10** = bank_usd + ecocash (research proposes; still pending in preferences).
