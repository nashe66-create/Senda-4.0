# Wedge comparison — schools vs medical vs funeral/policies vs utilities

**Workstream:** D (research plan)  
**Corridor:** UK → Zimbabwe  
**Question:** Confirm or change private school fees as first wedge.  
**Method:** Public sources + product/docs context. No partner interviews claimed.  
**Date:** 2026-11-18

---

## Verdict

**Recommend schools first.** Do **not** replace the school-fee wedge with medical, funeral/policies, or utilities.

Schools best match Senda’s moat (allowlisted institution + beneficiary Link + Obligation + proof) on the UK→ZW corridor. Utilities win on fetchability and low onboarding friction but are crowded and underuse Links. Funeral premiums are highly fetchable but sit under heavier insurance AML and strong incumbents. Medical pain is real but dues are messy (ad-hoc invoices / shortfalls).

Optional later: a **thin API spike** (policy# or meter validate) to rehearse Connect fetch shapes — not a parallel live wedge.

---

## Scoring rubric

Scores are **1–5** (5 = best fit for Senda’s first wedge). “Best” means: proves Connect+Biller with `mto_settles`, builds density MTOs will buy, without becoming a remittance competitor or clearing house.

| Criterion | What “good” means for Senda |
| --- | --- |
| Diaspora pain | Recurring UK→ZW need; diversion / no-proof failure modes; willingness to pay for certainty |
| Fetchable dues | Can present a pay-time Obligation (amount/currency/due) without day-one ERP |
| Settle clarity | Verifiable institution destination (bank USD / EcoCash till) partners can hit with a ref |
| MTO appetite | Partners already sell or want purpose pay into this category; gap is validation+proof not FX |
| Onboarding cost | Effort to get 5–10 live Institutions + Obligations in pilot |
| Regulatory load | KYB / sector supervision / AML sensitivity of third-party pays (lower = better for MVP) |

---

## Scorecard

| Criterion | Schools | Medical | Funeral / policies | Utilities |
| --- | --- | --- | --- | --- |
| Diaspora pain | **5** | 4 | 4 | 3 |
| Fetchable dues | **4** | 2 | **5** | **5** |
| Settle clarity | **5** | 3 | 4 | **5** |
| MTO appetite | **4** | 3 | 3 | 4 |
| Onboarding cost (higher = easier) | 3 | 2 | 3 | **4** |
| Regulatory load (higher = lighter) | **4** | 3 | 2 | 4 |
| **Total** | **25** | **17** | **21** | **25** |

Schools and utilities tie on raw total; **schools win on moat fit** (see below). Funeral is close on mechanics but loses on regulation + incumbent rails. Medical is last for MVP.

---

## Criterion detail

### 1. Diaspora pain

**Schools — high.** Education is a stated remittance purpose at the same level as health in a UK-diaspora COVID-era survey (both **19.23%**; funerals **15.38%**).[^pmc] Remittance timing is commonly described as aligning to January / May / September term cycles.[^zimx] Product history shows repeated attempts to sell **direct school-fee** rails (Zympay + ZB Bank “Schools Direct”; ClicknPay/Topa school + university fees).[^zympay][^clicknpay][^topa] Pain modes match Senda’s problem statement: person→person→bursar diversion, fake accounts, kids excluded when the school has no payment record.[^pivot][^zympay]

**Medical — high pain, worse fit.** Same survey ranks health with education.[^pmc] Diaspora Meds, ClicknPay healthcare / medical-aid, EcoCash Home/Diaspora Wallet, and Rugare-style diaspora medical-aid plans all target the need.[^diasporameds][^clicknpay][^ecocash-herald][^rugare] But much of the pain is **urgent one-off invoices** or **medical-aid shortfalls**, not a clean recurring Obligation catalogue.

**Funeral / policies — high cultural + productized.** Funerals are a major remittance purpose.[^pmc] Nyaradzo Sahwira International Plan markets diaspora cover from ~$20/month with repatriation benefits; EcoSure sells mobile funeral cover; topup.co.zw already takes diaspora card pays against a **policy number**.[^sip][^ecosure][^nyaradzo-pay]

**Utilities — real but lower stakes.** ZESA tokens, water, municipal rates are standard diaspora bill-pay SKUs (PaTom, ZimBuyer, Topa, EcoCash Diaspora Wallet).[^patom][^zimbuyer][^topa][^ecocash-bt] Failure modes are inconvenience more often than “child sent home” or “no funeral cover.”

### 2. Fetchable dues

**Schools — good enough without ERP.** Senda’s locked freshness model (fee plans → per-student Obligations; grade/class templates + exceptions; fetch-at-pay) matches how ZW school systems already bill: ZivoFees / Makronexus advertise class-level templates, bulk invoice generate, multi-currency USD/ZiG, EcoCash/Paynow/bank.[^zivofees][^makronexus] BBPS treats education fees as a first-class category with student unique id + fetch-then-pay.[^bbps-cbse][^bbps-pg] **Unknown:** share of pilot schools already on ZivoFees/Makronexus vs Excel; willingness to run templates without daily CSV (workstream B).

**Medical — weak.** Hospital/clinic bills are invoice-driven and amount-unstable until issued; Diaspora Meds UX is “upload invoice / enter amount,” not fetch Obligation.[^diasporameds] Medical-aid **premiums** are more fetchable (member/policy id), but shortfalls and provider tariffs break a simple due ledger.[^psmas-faq]

**Funeral / policies — strongest fetch.** Policy number → balance/due is already live on topup.co.zw for Nyaradzo (confirm details, then pay).[^nyaradzo-pay] Recurring monthly premiums map cleanly to Obligations.

**Utilities — strongest fetch (commodity).** Prepaid meter / account number is the classic BBPS fetch-or-validate pattern.[^bbps-pg] Aggregators already operate on meter + amount.[^zimbuyer] Little need for a Beneficiary Link layer beyond the meter.

### 3. Settle clarity

**Schools — clear.** Private schools publish USD nostro / trust accounts and accept EcoCash/mobile money; finance tools record bank, EcoCash, ZIPIT/RTGS.[^falcon][^zivofees][^makronexus] One verified SettleDestination per school fits Biller KYB. Multi-currency books exist, but pilot can freeze USD (or documented EcoCash) destinations.

**Medical — fragmented.** Many clinics/hospitals/pharmacies; destinations vary; invoice payers often settle ad hoc. Medical-aid societies have clearer central accounts, but that is a different product (premiums vs provider bills).

**Funeral / policies — clear for licensed assurers.** Premiums settle to the assurer (or their collection partner). Incumbent rails already own confirmation UX.[^nyaradzo-pay]

**Utilities — clear.** Few large billers (ZETDC/ZESA, city councils). Prepaid token fulfilment is operationally different from bank settle-with-ref (token string as “proof”), which is a product/ops fork for Senda.

### 4. MTO appetite

**Schools — strong gap.** Global MTOs on ZW still skew **cash / bank / mobile wallet to a person**; WorldRemit/Remitly public ZW flows are remittance receive methods, not school Obligation validate.[^worldremit][^remitly-ecocash] Mukuru already runs a **biller listing / bill-payment** network (account number + amount; local & international settlement) and markets utility / digital product collections — a natural Connect buyer if Senda supplies allowlisted school+student dues and proof.[^mukuru-bills] Purpose apps (ClicknPay/Topa, Zympay-class, EcoCash Diaspora Wallet) explicitly list school fees.[^clicknpay][^topa][^ecocash-bt] PayAngel’s Direct-to-Merchant pattern shows MTO demand for institution pay — but **PayAngel does not list Zimbabwe** today.[^payangel-countries][^payangel-d2mr]

**Medical — moderate.** Listed on purpose apps; harder for MTO catalogue UX (emergencies, invoices). Less “directory density” story than schools or utilities.

**Funeral / policies — conflicted.** Mukuru sells its **own** funeral cover; Nyaradzo/EcoSure own diaspora premium collection. An MTO may want Senda less if the insurer already settles premiums end-to-end.

**Utilities — high catalogue appetite, low differentiation.** Mukuru bill pay calls out utility collections; EcoCash Diaspora Wallet leads with ZESA/DSTV/utilities.[^mukuru-bills][^ecocash-bt] Crowded; Senda risks becoming a redundant aggregator unless it owns something unique (it does not for meters).

### 5. Onboarding cost

**Schools — medium.** Pilot is **5–10 schools**: KYB, settle verify, student CSV → Links, term fee plan → Obligations (product-how-it-works). Discrete sales + ops hygiene; no national API required day one. Cost is relationship + data hygiene, not integration breadth.

**Medical — high.** Provider sprawl; invoice workflows; clinical/ops exceptions; harder pilot exit criteria.

**Funeral / policies — low count, high gatekeeping.** Few large assurers could cover volume, but they already have payment partners and IPEC compliance programmes — hard commercial onboarding for a thin instruction+proof layer.

**Utilities — lowest technical onboarding if aggregator APIs exist; highest strategic waste.** One ZESA integration looks cheap, but then Senda competes with EcoCash/Mukuru/prepaid aggregators on a commodity SKU and learns little about Beneficiary Links.

### 6. Regulatory load

**Schools — lighter for MVP.** Private schools are MoPSE-registered institutions; financial capacity / bank evidence appears in registration practice.[^mopse] Senda KYB treats them as billers, not as insurers. Education payments are not under IPEC insurance AML rules.

**Medical — medium+.** Medical aid societies sit under health / (increasingly) insurance-adjacent supervision; provider payments raise consumer-protection and dispute issues; health invoices can imply sensitive data handling.

**Funeral / policies — heaviest.** IPEC supervises insurance AML/CFT; CDD includes source of funds and ongoing monitoring; third-party / unrelated premium payers are a known risk theme; USD cash premium collections draw scrutiny.[^ipec][^africa-ahead] Building Connect into premium collection means partnering inside that regime even if Senda does not underwrite.

**Utilities — light–medium.** Standard bill pay / prepaid; fewer beneficiary-attribution AML edge cases than insurance third-party premiums. Still RBZ/MTO corridor rules for the partner who moves money.

---

## Moat fit (tie-break: schools over utilities)

Senda’s doctrine: **prove the right institution and beneficiary got paid for the right obligation**; partners move money.[^product]

| Wedge | Does Link (beneficiary) matter? | Diversion / wrong-pay risk | Incumbent density |
| --- | --- | --- | --- |
| Schools | **Yes** — student + school | High (P2P then bursar) | Medium (purpose apps exist; neutral Link layer rare) |
| Medical | Sometimes (patient) | High for cash handoffs; messy for invoices | Medium niche players |
| Funeral | Policyholder id | Medium (premium lapse) | **High** (Nyaradzo, EcoSure, Mukuru cover, topup) |
| Utilities | Weak (meter ≈ account) | Low–medium (wrong meter) | **Very high** |

Utilities can match schools on a numeric scorecard and still be the wrong first wedge: they do not force Senda to build the Link + Obligation + proof loop that later verticals reuse.

---

## Recommendation

### Schools first — **yes**

1. Highest alignment with locked product shape (Biller beside school systems; fee plans → Obligations; open student+school Links).[^product][^prefs]  
2. Strong diaspora pain + term cadence on UK→ZW (UK is a top remittance source; ~$0.59B UK corridor in 2024 RBZ tables; later reporting puts UK ~$0.71B).[^rbz-embassy][^bloomberg-remit]  
3. Settle destinations partners already understand (USD bank / EcoCash).  
4. MTO/purpose-app gap is **validation + attribution + proof**, not “another ZESA token seller.”  
5. Lighter regulation than insurance premiums.

### Not first

| Wedge | Why not first | When later |
| --- | --- | --- |
| Utilities | Commodity; crowded; weak Link moat | After school density; optional Connect catalogue SKU |
| Funeral / policies | IPEC AML + incumbent collection rails | Once Connect proof is trusted; assurer-led integration |
| Medical | Unstable dues; provider sprawl | After Obligation + proof patterns proven; start with medical-aid **premiums** before hospital invoices |

### Parallel thin spike?

**No live parallel wedge.** Optional engineering spike only: one **validate identifier** path (policy# or meter) against a sandbox stub to keep Connect APIs vertical-agnostic — without KYB’ing insurers/utilities in pilot.

---

## Implications for decision #9 (tech stack)

#9 **LOCKED:** **Next.js + TypeScript + Postgres**; Biller beside school systems; no NN / no ERP / no PSP-core day-one.[^prefs]

| If schools-first (recommended) | Stack consequence |
| --- | --- |
| Domain | Prioritise Institution → Beneficiary → Link → FeePlan → Obligation → Attempt → Instruction → Confirmation → Proof. Keep enums vertical-agnostic (`institution_type`) but **ship school UX first**. |
| Freshness | Templates + bulk Obligation generate + fetch-at-pay + stale flags — **not** ERP connectors or daily full-roster CSV in MVP.[^product] |
| Settle | Model **bank USD + EcoCash till** SettleDestination snapshots; do not build prepaid-token fulfilment as core (#10 still open). |
| Integrations | Day-one: partner API + manual/ops confirm. **Defer:** ZivoFees/Makronexus pull, ZESA aggregators, insurer premium APIs, hospital invoice OCR. |
| Data / files | Postgres for ledger/recon; object storage for proof artifacts (JSON/PDF). Relational fit > document DB for three-way recon. |
| Identity | School Biller login + partner API keys; no consumer remittance identity stack. |
| Hosting | UK/EU-friendly app hosting acceptable for MVP docs; **flag** any ZW data-residency asks from schools/MTOs as **unknown** until outreach. |
| What would change #9 if we picked wrong wedge | Utilities-first → aggregator/token APIs + less Biller roster UX. Funeral-first → stricter audit logging, policy CDD fields, insurer SSO. Medical-first → document upload pipeline and dispute states. **Avoid those until schools prove the loop.** |

**#9 lock text (recorded LOCKED):**  
*Stack = Next.js App Router + TypeScript + Postgres; partner API keys + school/ops auth; S3-compatible proofs; Biller optimised for school fee plans/Obligations/Links; Connect vertical-agnostic; no day-one ERP/utility/insurer connectors / no NN / no PSP-core; settle destinations = partner-payable bank/EcoCash snapshots (#10 proposed).*

---

## Unknowns (founder / partner outreach required)

| ID | Unknown | Blocks |
| --- | --- | --- |
| U1 | Will Mukuru / Vybe-class / EcoCash-class partners consume a **Connect** Obligation API for schools, or only list billers in their own directory? | Demand (A), API shape |
| U2 | Pilot school mix: Excel vs ZivoFees/Makronexus; template willingness | Supply (B), freshness |
| U3 | Share of school fee volume inside UK→ZW remittances (survey purpose ≠ corridor $ share) | Sizing |
| U4 | Whether MTOs can already settle **with arbitrary customer_reference** to school USD accounts / EcoCash tills | #10 + Connect instructions |
| U5 | IPEC / assurer appetite for a third-party instruction+proof layer (if funeral ever) | Later wedge |
| U6 | Data residency / PII constraints from ZW schools or UK partners | #9 hosting |
| U7 | Zympay / Topa / ClicknPay competitive overlap — partner, ignore, or displace? | GTM |

---

## Sources

[^pmc]: Mhlanga & Ndhlovu (and co-authors), “Rising to the occasion: Diaspora remittances to Zimbabwe during the COVID-19 pandemic,” *PMC* — remittance purposes: health 19.23%, school fees/education 19.23%, funerals 15.38%. https://pmc.ncbi.nlm.nih.gov/articles/PMC9359510/

[^zimx]: ZimX executive summary — UK diaspora remittance timing tied to school-fee periods (Jan/May/Sep); cites RBZ remittance totals. https://zimx.io/downloads/ZimX_01_Executive_Summary.pdf

[^rbz-embassy]: Embassy of Zimbabwe (USA) diaspora page — RBZ remittance tables: UK **$586.6m (27.3%)** in 2024; UK **$313.0m (29%)** H1 2025. https://zimembassydc.org/the-zimbabwean-diaspora/

[^bloomberg-remit]: Bloomberg — Zimbabwe remittances **$2.45b**; UK **$709.6m** in cited year. https://www.bloomberg.com/news/articles/2026-01-26/zimbabwe-foreign-remittances-rose-14-to-2-45-billion-last-year

[^zympay]: NewZimbabwe / TechUnzipped — Zympay + ZB Bank Schools Direct (diaspora school fees into school accounts). https://www.newzimbabwe.com/zympay-takes-back-to-school-forward-with-digital-innovation/ · https://techunzipped.co.zw/2018/07/zb-bank-partners-zympay-to-facilitate-digital-payments-for-school-fees/

[^clicknpay]: TechnoMag — ClicknPay UK→ZW purpose pays (utilities, school fees, healthcare, medical aid, airtime). https://technomag.co.zw/clicknpay-simplifies-cross-border-payments/

[^topa]: Zimbabwe Advocate — Topa (ClicknPay) UK app: schools, utilities, medical aid, etc., with reference. https://zimadvocate.com/2026/10/22/new-topa-app-lets-zimbabweans-in-the-uk-pay-bills-back-home-directly/

[^diasporameds]: Diaspora Meds — pay Zimbabwe hospital/clinic bills from abroad (invoice/amount workflow). https://zwbookings.diasporameds.com/pay-bills

[^sip]: Nyaradzo Sahwira International Plan — diaspora funeral cover from ~$20/month. https://sip.nyaradzo.global/

[^nyaradzo-pay]: Paynow blog — topup.co.zw Nyaradzo payments; policy lookup; diaspora Visa/Mastercard. https://paynow.co.zw/blog/a-simple-guide-to-nyaradzo-online-payments-for-zimbabweans-at-home-and-abroad/

[^ecosure]: EcoSure funeral cover — EcoCash USSD premiums. https://ecosure.co.zw/products/funeral-cover/

[^mukuru-bills]: Mukuru Zimbabwe Bill Payment — list products; biller + account number + amount; local & international settlement; utility use case. https://www.mukuru.com/zw/services/collections/bill-payment/

[^ecocash-bt]: Business Times — EcoCash Diaspora Wallet (UK/SA launch framing): school fees, utilities, ZESA, merchants, real-time confirmation. https://businesstimes.co.zw/ecocash-launches-diaspora-wallet-to-ramp-up-remittances/

[^ecocash-herald]: Herald — EcoCash product for diaspora: ZESA, school fees, insurance premiums, hospital bills. https://www.heraldonline.co.zw/ecocashs-new-product-targets-diaspora-community/

[^patom]: PaTom Connect — ZESA and Zimbabwe bills from diaspora. https://www.patomconnect.com/bills

[^zimbuyer]: ZimBuyer — buy ZESA tokens / bills from abroad (meter number). https://zimbuyer.com/content/9-buy-zesa-tokens

[^zivofees]: ZivoFees — ZW school finance; class templates; EcoCash/Paynow/bank; multi-currency. https://zivofees.com/

[^makronexus]: Makronexus Education — ZW school fees; USD+ZWG; EcoCash/InnBucks/PayNow/ZIPIT. https://education.makronexus.com/

[^falcon]: Falcon College admissions — published USD nostro / bank settle details. https://falconcollege.com/admissions/

[^worldremit]: WorldRemit — send money to Zimbabwe (receive methods; not institution Obligation pay). https://www.worldremit.com/en-gb/zimbabwe

[^remitly-ecocash]: EcoCash partners — Remitly into EcoCash USD wallet; wallet then pays locally. https://www.ecocash.co.zw/partners/21/remitly

[^payangel-countries]: PayAngel destinations — Zimbabwe not listed. https://payangel.com/help/countries-covered/

[^payangel-d2mr]: PayAngel Direct-to-Merchant Remittances — institution collections pattern. https://payangel.com/help/direct-to-merchant-remittances/

[^bbps-cbse]: CBSE circular — enable school fees via BBPS; education as essential category. https://saras.cbse.gov.in/SARAS/Circulars/OSAMS_Circular/Circular%20BBPS.pdf

[^bbps-pg]: Bharat Connect Procedural Guidelines V6 — BOU/COU; fetch-and-pay vs validation-and-pay. https://www.bharat-connect.com/strapi/uploads/Procedural_Guidelines_BBPS_V6_November_2025_Website_b15d06fcb5.pdf

[^mopse]: Herald — private school licensing / MoPSE registration process (includes financial capacity evidence). https://www.heraldonline.co.zw/private-schools-licensing-procedure/

[^ipec]: IPEC AML/CFT page — insurance/pensions AML supervisor. https://ipec.co.zw/aml-cft/

[^africa-ahead]: Africa Ahead — USD life covers and AML scrutiny; third-party premium risk theme. https://afahpublishing.com/rising-us-dollar-covers-raise-anti-money-laundering-scrutiny-for-zimbabwes-life-insurers/

[^psmas-faq]: PSMAS FAQs — shortfalls when provider charges exceed tariff. https://psmas.co.zw/faqs/

[^rugare]: Herald — Rugare Medical diaspora medical-aid plan narrative. https://www.heraldonline.co.zw/presidential-inspiration-diasporan-investment-transforms-health-service-delivery/

[^pivot]: Senda 4.0 pivot — UK→ZW school fees first wedge; diversion problem; `mto_settles`. `/agent/repos/Senda-4.0/senda/docs/senda-4.0-pivot.md`

[^product]: `docs/product-how-it-works.md` — Connect/Biller surfaces; Obligation freshness; school-fee wedge must work before medical/funeral reuse.

[^prefs]: Project `preferences.md` — UK→ZW first corridor; #9 **LOCKED** Next.js+Postgres (+ API keys, S3 proofs, no NN/ERP/PSP-core); #10 pending (`bank_usd` + ecocash proposed); fee plans → Obligations.

---

## Handoff to synthesis (`lock-brief.md`)

- **First wedge:** UK → ZW **private school fees** (confirm).  
- **Not first:** utilities (score tie, moat miss), funeral (reg + incumbents), medical (dues).  
- **#9:** **LOCKED** — school-optimised Next.js+Postgres; defer ERP/utility/insurer connectors.  
- **#10:** **proposed** bank_usd + ecocash (pending).  
- **Open:** U1–U7; depend on workstreams A/B/C for partner settle reality and school supply hygiene.
