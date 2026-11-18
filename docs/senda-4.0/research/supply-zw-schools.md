# Workstream B — Supply: ZW private schools & dues hygiene

**Goal (from research plan):** How ZW private schools bill today; willingness for grade/class templates + exceptions (not daily CSV); KYB / settle-account friction; pilot shortlist criteria for 5–10 schools.  
**Locks:** Biller MVP scope; freshness model. Informs stack (#9).  
**Method:** Public product docs, school fee pages, bank/EcoCash KYC checklists. **No school or bursar interviews done** — founder outreach still required to validate willingness and pilot names.  
**Corridor context:** UK → ZW; Biller beside school finance tools; Fee plans → Obligations (not full ERP). See `docs/senda-4.0/product/how-it-works.md`.

---

## 1. How ZW private schools manage fees today

### Operating reality (high confidence on pattern; medium on share)

Private schools run a **term cycle** (typically 3 terms/year). Bursars maintain: fee structure by level/class and often **day vs boarding**; per-student balances; receipts; arrears; multi-currency (USD Nostro common for published fees; ZiG/ZWG also tracked). Parents pay via a **mix** of:

| Channel | Typical use | Evidence |
| --- | --- | --- |
| Bank transfer / RTGS / ZIPIT into school **USD Nostro** | Primary for published fee schedules | Firm Foundation (FBC Nostro + student-name ref); Watershed / Edrrovale / Sandon / Peterhouse fee pages; Heritage “email bursar for bank details” |
| EcoCash / OneMoney / InnBucks / Telecash | Walk-in + remote mobile money | Heritage Paynow + EcoCash; Makronexus / ZivoFees / ZimSchool / CAIMS marketing; EcoCash merchant “Schools” checklist |
| Paynow (card / Zimswitch / wallets) | Online parent pay | Heritage School; ZivoFees Paynow; Makronexus PayNow |
| Cash at bursar | Still common | Every local fee product records cash; SchoolKeeper desk-receipt flow |
| WhatsApp proof-of-payment | Informal recon | SchoolKeeper WhatsApp assistant pitch; CAIMS WhatsApp receipts |

**Diaspora path today:** usually remittance → relative → bursar, or ad-hoc bank details WhatsApp’d; purpose apps (e.g. Topa/ClicknPay school-fee pitch; historical ZB–ZymPay) try direct-to-school but still need a clean student/ref layer. That gap is Senda’s supply job.

### Tool landscape (beside Excel)

| Tool | What it is | Fee model (vendor) | Fit vs Senda |
| --- | --- | --- | --- |
| **Excel / Google Sheets / paper ledgers** | Still the default for many bursaries | n/a | Cold-start: CSV from register; template fees in Biller |
| **ZivoFees** | ZW-focused school finance SaaS | ~$15–55/mo by student band | Class/level **fee templates** → **bulk invoices**; CSV student import; EcoCash/Paynow/RTGS; parent portal |
| **Makronexus Education** | Full SIS + fees (private + public pitch) | Private ~$99/mo ≤1k students; custom; public “free” via MoE claim | Term fee structure → billing run → receipt → reconcile; USD+ZWG; EcoCash/InnBucks/PayNow/ZIPIT |
| **SchoolKeeper** | Fees + bank-statement matching (not full GL) | Quote-based | Closest analogue to Senda’s “fees ledger beside Pastel”: term bill runs, student number as ref, CBZ statement match |
| **CAIMS** | SIS + dual-currency fees | ~$80–120/term flat | Explicit **Excel register migration**; USD/Nostro/ZWG/EcoCash |
| **ZimSchool (Statotech)** | SIS + fees | ~$2.50/learner/term (min ~$2k) | Fee structures per level/class/boarding → bulk term invoices; EcoCash/cash |

**Confidence:** High that these products exist and converge on the same bursar workflow. **Low–medium** on installed base (ZivoFees “500+ schools / $50M+” is vendor marketing; treat as unverified). **No public market-share breakdown** of Excel vs SaaS — every vendor’s homepage assumes spreadsheets are still painful and common.

### Fee structure shape (high confidence)

Published schedules show **templateable** dues, not unique per-child pricing as the default:

- Base tuition by form/grade band  
- Day vs boarding multiplier  
- Levies (PTA, capital, sports, science, transport, insurance)  
- Sibling / early-pay discounts as **exceptions**  
- Partial-pay plans negotiated with finance (Watershed: 80% before term, rest by half-term)

That maps cleanly to Senda: **Fee plan (grade/class + boarding)** → bulk Obligations → Biller overrides for scholarships/siblings/payment plans.

---

## 2. Realistic freshness without painful CSV

### What local tools already train bursars to do

Across ZivoFees, Makronexus, SchoolKeeper, ZimSchool, CAIMS the happy path is identical:

1. **Import roster once** (CSV/Excel)  
2. **Define fee templates** by class/level/(boarding)  
3. **Bulk-generate** term invoices  
4. Record or auto-match payments → balances update  
5. Touch **exceptions** only (new joiners, leavers, one-off charges, discounts)

CSV is **onboarding / term roster upsert**, not a daily 600-row edit loop. SchoolKeeper goes further: parents quote a stable **student number** on bank/EcoCash; statements auto-suggest matches — recon pain, not dues-definition pain.

### Senda-defensible freshness (aligns with product-how-it-works)

| Cadence | School does | System does |
| --- | --- | --- |
| Onboarding | KYB + settle verify; student CSV → Links; fee templates | Generate Obligations |
| Each term | Confirm/adjust templates; bulk assign; roster upsert | Obligation-required Connect; versioned destinations |
| Ongoing rare | Join/leave; amount override; settle-account change | Proven Connect pays auto-adjust ledger |
| Local/off-platform pays | Optional manual “external payment” in Biller | Flag stale / underpaid Obligations |
| Pilot ops | Weekly hygiene check (not daily CSV) | Remove unmaintained schools from live Connect |

**Willingness (inference, medium confidence):** Schools already accept template + bulk generate in every ZW fee product pitched at them. Asking the same in Biller is familiar. Asking for **daily full-ledger CSV sync** is what vendors advertise against — expect refusal. **Founder must still confirm** with 3–5 bursars that they will maintain exceptions + term refresh for diaspora-linked students (or whole school) without ERP integration.

**MVP rule:** Term freshness + exception UI is enough. Do **not** block Connect on ERP pull. Do **not** require daily local-payment logging for pilot; accept known drift with stale flags + ops SLA.

---

## 3. KYB / settle-account friction

### What schools already have (high confidence for registered private schools)

Legitimate private schools typically already hold:

- Company / trust / church legal personality (Pvt Ltd common for private schools)  
- Ministry of Primary & Secondary Education registration path  
- ZIMRA / NSSA for staff  
- At least one **fees bank account** (often USD Nostro, sometimes separate ZiG)  
- Often EcoCash merchant or Paynow merchant for parent pay  

So Senda KYB is mostly **document collection + destination verification**, not “create a company.”

### Bank settle friction (high)

Corporate account opening checklists (e.g. ZB, NMB) routinely ask for: Certificate of Incorporation, MoA/AoA, CR14 (and related CR forms), tax clearance, board resolution, director/signatory IDs + proof of residence, photos, sometimes prior bank statements / deposit. **Implication:** copying bank KYC into Biller is heavy but **document-shaped** — schools that already bank can usually produce packs; new/informal ECD centres may stall.

### EcoCash merchant friction (high on checklist; medium on school experience)

EcoCash publishes a **Schools** checklist: certified IDs of ≥2 executives, letter requesting account, proof of business address, beneficial ownership form (**privately owned schools**), mandate for signatories. Trusts/churches have parallel packs (trust deed / constitution). Lighter than full bank opening, but still multi-party and slow if executives are unavailable.

### Product friction specific to Senda

| Friction | Why it bites | Mitigation for MVP |
| --- | --- | --- |
| Who owns the settle account? | Trust / SDC / church / proprietor / “school fees” sub-account ambiguity | Require named entity match + mandate; one primary SettleDestination first |
| Multi-destination | USD Nostro + ZiG + EcoCash till | Pilot Connect types (#10 **LOCKED**): `bank_usd` + school-owned `ecocash`; prefer one primary per school; ZiG later |
| Ref hygiene | Schools already ask “student name” or student number on transfers | Senda `customer_reference` must be teachable to bursar + partner; show on Biller payment list |
| Fear of sharing bank details | Fraud / wrong-account history | KYB + verified destination + freeze on Instruction; proof back to school |
| Ops capacity | Small bursary, WhatsApp-driven | Templates + bulk; ops helps first two terms |
| Refusal to complete KYB | Stage kill criterion already in work plan | Screen for willingness before deep build |

**Confidence:** High that document friction is real and checklistable. **Low** on refusal rate until outreach — treat “schools refuse KYB/settle” as a go/no-go to measure early.

---

## 4. Pilot shortlist criteria (5–10 schools)

Use as a **scorecard**, not a vanity list. Prefer a Harare (and optionally Bulawayo) cluster for founder reach.

| # | Criterion | Why |
| --- | --- | --- |
| 1 | **Private** registered school (not MoE public day-one) | Clearer settle ownership; Makronexus public path is different politics |
| 2 | **Published or readily shareable USD bank** (or school-owned EcoCash — #10 **LOCKED**) | Partner `mto_settles` needs a reachable destination |
| 3 | **Bursar + head/proprietor** named and responsive within ~2 weeks for KYB pack | Docs don’t move without both |
| 4 | **Diaspora signal** — Cambridge/independent/boarding, or known UK-parent cohort | Demand exists for Connect |
| 5 | **Fee structure is templateable** (grade/class ± boarding; exceptions rare) | Proves freshness model |
| 6 | **Accept Biller beside** existing Excel/SaaS — no requirement to replace Makronexus/ZivoFees/Pastel | Matches non-goal “not school ERP” |
| 7 | Size **~150–1,000** learners | Enough Links; not ops-impossible |
| 8 | Willing to use **open student+school Links** + unique Senda refs on inbound pays | Locked decision #2 |
| 9 | Agree **term refresh + exception** SLA; accept weekly ops hygiene | Freshness without daily CSV |
| 10 | At least **5–10 diaspora-relevant students** committed for first live loop (or sandbox settle with real KYB) | M6 exit needs real refs |

**Deprioritize:** schools that insist Senda becomes their full ledger; multi-campus trusts that cannot name one settle account; entities that will only take cash; schools that demand ERP API sync before first payment.

**Outreach still required:** no named pilot list from this desk research. Work-plan backlog item 15 remains open.

---

## 5. Implications for Biller MVP and #9

### Biller MVP scope (recommend lock)

**In:**

- Manual/ops-assisted **KYB** (entity type, docs checklist, status)  
- **SettleDestination** verify (account/till + currency + ownership evidence); freeze into Instructions  
- Student **CSV import** → Beneficiaries + open Links  
- **Fee plans / class-grade templates** + bulk Obligation generate + per-student override  
- Payments list (Connect-proven + manual external) + **proof download**  
- Stale / missing-Obligation flags; thin exceptions queue  

**Out (phase 2+):**

- Live pull from ZivoFees / Makronexus / SchoolKeeper / CAIMS / ZimSchool  
- Replacing school GL/Pastel  
- Daily local-payment mandatory logging  
- Multi-destination routing per student  
- Full bursar accounting / payroll / report cards  

### Freshness model (recommend lock with #9)

Same as product-how-it-works research note: **templates → bulk Obligations → Biller exceptions**; obligation-required fetch-at-pay; CSV = onboarding/term roster; ERP pull later. This is what ZW tools already teach — Senda is not inventing a new bursar habit, only a purpose-settlement ledger beside theirs.

### Stack (#9) implications

Proposed **Next.js + TypeScript + Postgres** remains a fit for supply constraints:

| Need from supply | Stack implication |
| --- | --- |
| KYB doc + CSV + proof artifacts | Object/file storage + metadata in Postgres |
| Fee plans / Obligations / Links / Attempts | Relational model; strong uniqueness on refs |
| School login + roles (head vs bursar) | Auth + RBAC; no NN |
| Beside-ERP, not sync | No day-one connector framework; webhook/import adapters later |
| Pilot ops hygiene | Admin/ops UI + audit trail enough |

**Do not** let #9 wait on ERP partner APIs. **Do** ensure schema supports FeePlan → bulk Obligation generation and SettleDestination versioning from day one.

### Risks to surface in lock-brief

1. Vendor SaaS already owns bursar UX — Senda must stay thin (proof + Links), not compete with ZivoFees.  
2. Settle multi-currency / multi-till complexity — constrain pilot to one destination.  
3. Freshness drift from local cash/EcoCash pays not logged in Biller — accept with SLA or lose Connect accuracy.  
4. KYB refusal / slow packs — measure in first 5 outreach conversations.  
5. Purpose-pay competitors (Topa/ClicknPay, bank school-fee rails) may already hold school accounts — Senda differentiates on **Obligation + Link + partner-neutral proof**, not on being another Paynow button.

---

## 6. Sources

| Source | Used for |
| --- | --- |
| [zivofees.com](https://zivofees.com/), [how-it-works](https://zivofees.com/how-it-works), [pricing](https://zivofees.com/pricing), [features](https://zivofees.com/features), [about](https://zivofees.com/about) | Templates, bulk invoice, CSV, Paynow/EcoCash, vendor claims |
| [makronexus.com school fees](https://www.makronexus.com/school-fees-management-zimbabwe), [education.makronexus.com](https://education.makronexus.com/), [pricing](https://edu-site.makronexus.com/pricing), [terms](https://www.makronexus.com/terms) | Term billing run, USD/ZWG, rails, private pricing |
| [schoolkeeper.io](https://schoolkeeper.io/) + help (record payment, student number, statements) | Fees-beside-Pastel pattern; student-number refs; bank match |
| [caims.co.zw](https://caims.co.zw/) | Excel migration; dual currency; local onboarding |
| [statotec.com/products/school-erp](https://statotec.com/products/school-erp), [school.statotec.com](https://school.statotec.com/) | ZimSchool fee structures + EcoCash |
| [Heritage School online payments](https://www.theheritageschool.net/online-payments/) | Paynow + bank + bursar desk mix |
| Firm Foundation / Watershed / Edrrovale / Peterhouse / Sandon fee pages | Template fee shapes; USD Nostro banking |
| [EcoCash Merchants](https://ecocash.co.zw/merchants/) | Schools KYC checklist |
| ZB / NMB corporate account checklists | Bank KYC friction |
| [registercompany.co.zw private school](https://registercompany.co.zw/start-business/private-school) | Legal entity path for private schools |
| Topa / ClicknPay / historical ZB–ZymPay coverage | Diaspora direct-to-school competitive context |
| Internal: `docs/senda-4.0/product/how-it-works.md`, `docs/senda-4.0/research/research-plan.md`, Project `preferences.md`, work plan / pivot | Product constraints & locks |

---

## 7. Confidence summary

| Claim | Confidence | Notes |
| --- | --- | --- |
| Template + bulk term billing is the ZW SaaS norm | **High** | Multiple independent products |
| Excel/manual still widespread | **High** (pattern) | Inferred from vendor positioning + migration offers; no census |
| Schools will accept Senda templates without daily CSV | **Medium** | Strong analogy; **unvalidated by interviews** |
| KYB/settle packs are the main onboarding bottleneck | **High** (docs) / **Medium** (refusal rate) | Checklists clear; refusal unknown |
| USD bank is the right first SettleDestination | **High** for diaspora fees | Matches published fee banking |
| Installed-base ranking of ZivoFees vs Makronexus vs Excel | **Low** | Vendor claims only |
| Named 5–10 pilot schools | **None yet** | Outreach required |

---

## 8. Open questions for founder outreach

1. Which 5–10 schools (names) meet the scorecard — and who is the bursar WhatsApp?  
2. Will they complete KYB + settle verify before any MTO is live?  
3. One settle account: USD Nostro only for pilot — acceptable?  
4. Will they maintain whole-school Obligations or only a diaspora cohort?  
5. Any school already on ZivoFees/Makronexus/SchoolKeeper that wants **beside** integration vs export CSV only?
