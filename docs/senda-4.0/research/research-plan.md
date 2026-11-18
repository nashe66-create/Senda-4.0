# Research plan — lock wedge + stack (#9)

**Goal:** Enough evidence to (1) confirm or change UK→ZW school fees as first wedge, (2) lock tech stack (#9), (3) lock ZW settle methods (#10).

## Why research before locking #9
Stack choice depends on: partner API surface (Connect), Biller UX constraints, settle-destination types, compliance/data residency hints, and whether we integrate school ERPs / ZW fee systems day one vs templates-only.

## Workstreams

### A — Demand (MTOs + diaspora)
- Which MTOs/purpose apps already sell or plan ZW school-fee / bill pay (Mukuru, Remitly, WorldRemit, PayAngel, Vybe-class)?
- UK→ZW corridor size / school-fee share if published
- What partners need from a Connect API (fetch due, instruct, confirm, proof)
- Killer objections (want Senda to settle, want ERP-perfect dues, etc.)

**Output:** `docs/senda-4.0/research/demand-mto-diaspora.md`  
**Locks:** wedge demand side; Connect API priorities

### B — Supply (schools + dues hygiene)
- How ZW private schools bill today (Excel, ZivoFees, Makronexus, paper)
- Willingness to run grade/class templates + exceptions (not daily CSV)
- KYB / settle-account friction
- Pilot shortlist criteria for 5–10 schools

**Output:** `docs/senda-4.0/research/supply-zw-schools.md`  
**Locks:** Biller MVP scope; freshness model

### C — Settle rails + stack fit (#9 / #10)
- How diaspora fees actually land in ZW (bank USD, EcoCash, Paynow, ZIPIT)
- What MTOs can already pay into; gaps Senda must document in instructions
- Stack options scored: Next.js+Postgres vs alternatives; hosting; identity; file/object for proofs
- What #9 must support in first 90 days vs later (ERP pull, webhooks, PDF proofs)

**Output:** `docs/senda-4.0/research/rails-and-stack.md`  
**Locks:** #9 stack (**LOCKED**), #10 settle methods (**LOCKED**)

### D — Wedge comparison
- Score schools vs medical vs funeral/policies vs utilities on: diaspora pain, fetchable dues, settle clarity, MTO appetite, onboarding cost, regulatory load
- Explicit “schools first / not first / parallel thin spike” recommendation

**Output:** `docs/senda-4.0/research/wedge-comparison.md`  
**Locks:** first wedge decision

## Synthesis (after A–D)
Coordinator merges into `docs/senda-4.0/research/lock-brief.md`: recommended wedge, #9 lock text, #10 lock text, open risks.  
**Post-synthesis (2026-11-18):** #9 and #10 recorded as **LOCKED** (founder confirmed; partner API outreach is ops sequencing, not a reopen of #10).

## Method
Web + public filings/docs; no pretending partner interviews happened. Flag where founder outreach is required.
