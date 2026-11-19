# Senda 4.0 — Project work plan

**Status:** Active plan (docs pack under `docs/senda-4.0/`)  
**Canonical copies:** [pivot](pivot.md) · [how it works](product/how-it-works.md) · [research lock brief](research/lock-brief.md) · [docs index](README.md)  
**Sources:** pivot narrative, product-spec + stage plan (historical park in senda3.0 PR #12), pivot agent transcript (bc-94f40c97)  
**Corridor correction (2026-11-18):** Founder lock — **first wedge is UK → Zimbabwe**, not UK → Nigeria. Older pivot/spec text that names Nigeria as the first corridor is superseded for this Project; Nigeria is a later expansion only.  
**Repo home:** [`nashe66-create/Senda-4.0`](https://github.com/nashe66-create/Senda-4.0)  
**Stack (#9):** **LOCKED** — Next.js App Router + TypeScript + Postgres; partner API keys + school/ops auth; S3-compatible proofs; Biller beside school systems; no NN / no ERP / no PSP-core day one.  
**Settle (#10):** **LOCKED** — `bank_usd` + school-owned `ecocash`; Paynow/ZIPIT school-local only; cash/relative wallets out of Connect; remittance partners settle with Senda validate→ref→confirm.  
**Language:** Generic partner / biller; school fees = first wedge. UX: amount due, pay code, payment reference, confirmed / needs a check, retry key — [connect-concepts §0](product/connect-concepts.md).

---

## 1. Context — 4.0 vs 3.0

| | **3.0** | **4.0** |
| --- | --- | --- |
| Shape | Consumer remittance app | B2B purpose-settlement network |
| Job | UK diaspora grouped transfers (one plan → N payouts) | Verify institution + beneficiary → instructions + ref → partner settles → recon → **proof** |
| Money movement | Senda via Fincra/Flutterwave (collect → FX → payout) | **Partner** moves money (`mto_settles` default) |
| Moat hope | Multi-recipient UX, ledger, fees | Neutral allowlisted Link layer + proof |
| Surfaces | Consumer app | **Connect** (remittance / purpose partners), **Biller** (organisations; first wedge schools), **Network** (shared density) |

**One sentence (locked):** Senda 4.0 doesn’t win by sending money cheaper — it wins by being the layer that proves the right organisation and person got paid for the right amount due.

**First wedge:** UK → Zimbabwe private school fees — 5–10 schools → pay codes → partner (or test loop) settles with Senda payment reference → recon → proof → then sell the network into more remittance / purpose partners. (Nigeria = later corridor expansion, not first wedge. Medical/utilities = later billers.)

---

## 2. What’s already done

| Item | Where | Notes |
| --- | --- | --- |
| Pivot narrative | [Senda-4.0 PR #1](https://github.com/nashe66-create/Senda-4.0/pull/1) · branch `cursor/add-senda-4-pivot-doc-3bc0` · path `senda/docs/senda-4.0-pivot.md` | Open, mergeable; docs-only; **still says UK → Nigeria** — needs amend on port/merge |
| Full 4.0 docs pack (pivot, product-spec, MVP PRD, architecture, research, stage plan, build guide, thesis/comps) | [senda3.0 PR #12](https://github.com/nashe66-create/senda3.0/pull/12) · `docs/senda-4.0/` | Parked there earlier because Cloud Agent push to Senda-4.0 was blocked; **canonical home is Senda-4.0**; pack still frames NG as first corridor in places |
| Doctrine lock | Pivot + product-spec | Connect = instruction + proof; prefer `mto_settles`; no adaptor-as-payer / open marketplace in MVP |
| Corridor lock | Founder correction + Project preferences | **UK → Zimbabwe** first wedge |
| This Project | Cursor Project “Senda4.0” | New operating home after the pivot |
| Code / product in Senda-4.0 | — | **Not started** (repo nearly empty on main) |

Pivot agent (bc-94f40c97) only copied the **pivot note** into Senda-4.0 — not the rest of the pack.

---

## 3. Proposed workstreams / ordered milestones

Aligned with product-spec §18 build sequence and stage operating plan. Doctrine from the pivot wins over older “Senda collects/FX” language in the build-guide draft. Corridor = **ZW**, per founder.

### M0 — Align & house the docs *(this Project, now)*
- Approve this work plan
- Merge Senda-4.0 PR #1 (or equivalent) **after** correcting first-wedge wording to UK → Zimbabwe
- Port remaining `docs/senda-4.0/` pack from senda3.0 PR #12 into Senda-4.0, rewriting first-corridor references to ZW (leave NG as later expansion where named)
- Resolve open decisions in §5 before build agents spin up

### M1 — Core domain + supply cold-start
- Data model: Institution, SettleDestination, Beneficiary, Link, Obligation (amount due), Attempt (payment), Instruction, Confirmation, Proof
- Ops/admin organisation checks (manual OK) + verified payout account (**ZW** pilot schools)
- Roster CSV → people; optional pay code (`link_code`) generation
- **Exit:** 1 verified pilot school in Zimbabwe + ≥20 people (can be seed/fixture)

### M2 — Instruction + reference
- Payment lifecycle: `created` → `instructed`
- Issue payment reference (`customer_reference`) + frozen payout snapshot; **retry key** safe to retry
- **Exit:** validate → pay instructions callable (API or test loop)

### M3 — Confirmation, recon, proof
- Ingest confirmation (`partner_webhook` / `manual_ops` / `school_mark`)
- Recon rules (payment reference + amount + currency; exact match MVP) → confirmed (`proven`) or needs a check (`needs_reconcile`)
- Payment proof JSON (+ optional PDF)
- **Exit:** happy-path proof + one mismatch demo

### M4 — Connect surface
- Partner API key + sandbox
- MVP endpoints: institutions, beneficiaries/links, validate, instructions, confirmations, attempts/proofs
- Happy-path Connect docs
- Webhooks later in sequence (`attempt.proven`, `needs_reconcile`, `cancelled`)

### M5 — Biller surface
- School login, students/CSV, payments list, proof download, settings/contacts
- Ops exceptions queue (can be thin admin)

### M6 — Wedge pilot loop
- Dogfood thin UI **if** founder keeps default (open decision #1)
- Design-partner outreach parallel (remittance / purpose-pay class — ZW corridor fit; none named as product identity)
- 5–10 **Zimbabwe** private schools; real or sandbox settle with Senda payment reference
- **Exit (MVP done):** product-spec §15 acceptance checklist green (corridor = ZW); `senda_settles` still absent

### Later (after wedge)
- Sell same network into more remittance partners; medical/utilities billers; denser Network effects  
- **Nigeria (and other corridors)** as expansion once ZW school-fee proof works  
- Not sequenced until first-wedge proof works

---

## 4. Near-term backlog (tracked-task candidates)

Concrete items suitable as Project tracker tasks after plan approval:

1. **Approve work plan + lock open decisions** (founder) — unblock build
2. **Amend + merge pivot PR #1** into Senda-4.0 `main` (first wedge → UK → Zimbabwe)
3. **Port full docs pack** from senda3.0 `docs/senda-4.0/` → Senda-4.0 (preserve product-spec, MVP PRD, architecture, research, stage plan; correct corridor to ZW)
4. **Scaffold repo skeleton** for 4.0 (app layout, domain package, env/config — no payout engine)
5. **Implement domain model + migrations** (entities in product-spec §6; pilot country `ZW`)
6. **Admin/ops KYB + SettleDestination verify** (P1) for ZW schools
7. **Beneficiary CSV import + Link codes** (P2)
8. **Instructions + `customer_reference` generation** (P3)
9. **Confirmation ingest + recon + proof JSON** (P4–P5)
10. **Connect API MVP + sandbox key** (`/v1` contract in product-spec §11)
11. **Biller payments + proof download screens** (product-spec §12)
12. **Dogfood thin pay-instructions UI** (only if decision #1 = yes)
13. **Process docs P1–P7** fill-in under `docs/processes/` (stage plan; stubs only today)
14. **Design-partner shortlist + outreach** (demand; ZW corridor; parallel to build)
15. **Pilot school shortlist (5–10 ZW private)** + KYB field checklist (supply)

---

## 5. Open decisions / questions for nashe

From product-spec §17, stage plan, and pivot-agent follow-through — **updated for ZW first wedge**. **Need answers before / as build starts:**

| # | Question | Default if silent |
| --- | --- | --- |
| 1 | Dogfood UI in first build? | **Yes, minimal** for cold-start (from prior spec) |
| 2 | Payer-bound Links vs open student+school pay? | **Open student+school** first; bind payer later |
| 3 | Pricing | **Defer**; instrument usage |
| 4 | First named design partner (remittance / purpose-pay class) for **UK → ZW**? | Outreach **parallel** to build — none required named in product |
| 5 | Nigeria / other corridors in data-model enums only for MVP (no live NG KYB)? | **Yes** — live pilot = **ZW** only |
| 6 | Merge Senda-4.0 [PR #1](https://github.com/nashe66-create/Senda-4.0/pull/1) now (after ZW wording fix)? | **Done** (durable docs on main) |
| 7 | Port full docs pack into Senda-4.0? | **Yes** — research + product pack under `docs/senda-4.0/` |
| 8 | Preferred path layout | **Locked:** `docs/senda-4.0/…` |
| 9 | Tech stack for Connect/Biller MVP? | **LOCKED:** Next.js App Router + TypeScript + Postgres; partner API keys + school/ops auth; S3-compatible proofs; Biller beside school systems; no NN / no ERP / no PSP-core day one |
| 10 | Settle methods for ZW pilot (bank transfer, EcoCash/mobile money till, both)? | **LOCKED:** `bank_usd` + school-owned `ecocash`; Paynow/ZIPIT school-local only; cash/relative wallets out of Connect; model = KYB → validate → instruct (frozen dest + ref) → partner confirm → proof |

**Stage kill criteria** (from stage plan — stop/reframe if true): every remittance partner insists Senda also moves money *and* that forces full remittance licensing day-one; ZW schools refuse KYB/settle details; proof-without-adaptor-as-payer rejected by every design partner.

---

## 6. Out of scope for now

Explicitly **not** this Project’s near-term build (pivot + product-spec non-goals, corridor-corrected):

- Being another Remitly on rates/speed; consumer remittance as the company
- `senda_settles` / adaptor-as-payer / Senda FX·collect·payout engine
- Core product dependence on Flutterwave/Fincra/EcoCash as *Senda’s* payout rail (optional last-mile only if a partner cannot reach destination — not MVP core)
- Open goods & services marketplace
- Multi-country production; **live Nigeria (or other non-ZW) KYB/pilot** until after first wedge
- Government MDA onboarding; live SIS / school ERP
- Full dispute legal playbooks, multi-PSP routing engine, SPI/API licensing ops
- Consumer growth loops; “agent for every company function”
- Shipping production Agent SDK bots for KYB/recon before processes + data model exist
- Catalog billers (airtime/DSTV/etc.) and health/rent verticals before the first-wedge (school-fee) proof works

---

## 7. Approval

**§5 #1–#10 are locked** (including #9 stack and #10 settle). Reply only if reopening a decision. Coordinator should create tracked tasks starting with the recommended first three below.

**Recommended first 3 tracked tasks**

1. Port full `docs/senda-4.0/` pack into Senda-4.0 (align path convention; correct first wedge to UK → Zimbabwe)
2. Scaffold domain model + KYB/beneficiary cold-start for ZW pilot (M1)
3. Instructions + confirmation/recon/proof happy path (M2–M3)
