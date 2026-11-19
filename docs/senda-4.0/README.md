# Senda 4.0 — docs pack

Canonical documentation for the Senda 4.0 purpose-settlement wedge lives under `docs/senda-4.0/`.

**First wedge (example, not the product limit):** UK → Zimbabwe private school fees — same pattern for other billers later.  
**Doctrine:** Remittance partners move money (`mto_settles`); Senda owns pay codes (Links), payment references, validation, recon, and payment proof.  
**Language:** [Connect concepts §0](product/connect-concepts.md) — partners/billers generic; plain UX terms (amount due, pay code, confirmed / needs a check, retry key).  
**Runnable app:** [`apps/web`](../../apps/web/README.md) (Next.js + Postgres M1 scaffold)

## Locked decisions (see also preferences)

| # | Decision | Status |
| --- | --- | --- |
| 1–8 | Dogfood UI, Links, pricing, outreach, ZW-only pilot, docs on main, port pack, path `docs/senda-4.0/` | **Locked** |
| **9** | Next.js App Router + TypeScript + Postgres; partner API keys + school/ops auth; S3-compatible proofs; Biller beside school systems; no NN / no ERP / no PSP-core day one | **LOCKED** |
| **10** | Pilot Connect settle: `bank_usd` + school-owned `ecocash`; Paynow/ZIPIT school-local only; cash/relative wallets out of Connect; remittance partners settle with Senda validate→ref→confirm | **LOCKED** |

## Index

### Product & doctrine
- [How it works](product/how-it-works.md) — working product spec
- [Connect concepts](product/connect-concepts.md) — plain-language + pseudocode model (lookup, pay code, amount due, validate/instruct/confirm, proof)
- [Pivot](pivot.md) — 3.0 → 4.0 narrative
- [Work plan](work-plan.md) — milestones M0–M6 + backlog
- [Project context](context/project-context.md) — short orientation

### Research (wedge + stack lock)
- [Research plan](research/research-plan.md)
- [Demand — MTO / diaspora](research/demand-mto-diaspora.md)
- [Supply — ZW schools](research/supply-zw-schools.md)
- [Rails & stack](research/rails-and-stack.md) — informs #9 / #10
- [Wedge comparison](research/wedge-comparison.md)
- [Lock brief](research/lock-brief.md) — synthesis; **#9 + #10 LOCKED**
- [School-received confirmation](research/school-received-confirmation.md) — options beyond MTO attest (RC-05–RC-07)
- [Bharat Connect / BBPS](research/bbps-india.md) — India school-fee rail reference (directory, fetch-then-pay, settlement)

### Testing (lock scenario pack)
- [Testing pack](testing/README.md) — scenario catalog, YAML cases, test agents, coverage map
- Run: `python3 docs/senda-4.0/testing/scripts/validate_pack.py`

### Legacy path stubs
Older paths redirect here so links do not break:
- `docs/senda-4-work-plan.md` → [work-plan.md](work-plan.md)
- `docs/project-context.md` → [context/project-context.md](context/project-context.md)
- `senda/docs/senda-4.0-pivot.md` → [pivot.md](pivot.md)
- `senda/docs/bbps-india.md` → [research/bbps-india.md](research/bbps-india.md)
