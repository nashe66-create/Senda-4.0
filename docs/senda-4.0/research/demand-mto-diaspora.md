# Workstream A — MTO / purpose-app demand (UK→ZW school fees)

**Status:** Public-web research only (2026-11-18). No partner interviews.  
**Locks this informs:** wedge demand side; Connect API priorities; inputs to stack #9.  
**Related:** `docs/senda-4.0/research/research-plan.md`, `docs/senda-4.0/product/how-it-works.md`, Project `preferences.md`.

---

## Executive take

1. **Corridor demand is real and large.** UK→ZW is a top remittance corridor (~USD 587m in 2024; ~USD 313m in H1 2025 ≈ 29% of MTA inflows). Education is a recurring, term-timed purpose — not a niche use case.
2. **Purpose/school-fee products are emerging, but incumbents are incomplete.** Classic MTOs (Mukuru, WorldRemit, Remitly) still mostly sell cash/wallet/bank remittance into ZW. Purpose layers are arriving via EcoCash Diaspora Wallet, Topa/ClicknShare, and (elsewhere) PayAngel/Vybe — not as a mature MTO school-fee SKU with fetchable dues.
3. **Senda’s wedge fits a clear gap:** partners want “pay school fees” without year-long per-school integrations; schools want refs + recon; senders want receipt/proof. That maps to Connect **validate → instruct+ref → confirm → proof**, with **`mto_settles`** (Senda does not move money).
4. **Closest competitive threat is aggregator/purpose apps that also settle** (ClicknShare/Topa, EcoCash), not Remitly/WorldRemit rate competition. Differentiator to sell: allowlisted Obligations + partner-agnostic proof, not FX or float.

**Confidence overall:** **Medium** on demand existence; **Medium-low** on who will buy Connect first and what they will pay (founder interviews required).

---

## 1. Corridor & diaspora size

| Metric | Figure | Source | Confidence |
| --- | --- | --- | --- |
| Total ZW remittances 2024 | ~USD 2.15bn | RBZ via Zimbabwe Embassy DC diaspora tables | High |
| UK→ZW 2024 | ~USD 586.6m (27.3%) | Same | High |
| UK→ZW H1 2025 | ~USD 313.0m (29%) | Same (through 30 Jun 2025) | High |
| UK→ZW 2023 | ~USD 447.8m (24.8%) | Same | High |
| Zimbabwe-born, England & Wales | ~122k (Census 2021) | ONS / cited widely | High |
| Broader UK Zim community | Often cited 200k–500k incl. second gen | Community/IOM estimates (not census) | Low–medium |
| UK→ZW avg total remittance cost | ~5.04% of £120 (Q3 2025) | World Bank RPW | High |

**Implication:** Even a small capture of education-purpose flows on this corridor is a meaningful pilot. Rate wars are not Senda’s job; purpose certainty is.

---

## 2. School-fee / education share of remittances

| Claim | Evidence | Confidence | Caveat |
| --- | --- | --- | --- |
| ~19% of UK-diaspora remittance *purposes* = school fees / education | Mbiba & Mupfumira COVID-era UK diaspora survey (PMC9359510); also cited by newZWire | **Medium-low** | Survey of remittance *purposes among respondents*, not % of dollar volume. Sample is UK Zimbabwe-born, not RBZ ledger tags. |
| School fees timed to Jan / May / Sep terms | ZimX UK–ZW corridor narrative; remittance-industry “back to school” commentary (e.g. Sitemere LinkedIn on peak season) | **Medium** | Pattern matches ZW private-school calendar; no public RBZ “education remittance” line item found. |
| Back-to-school is a remittance peak | Industry commentary; Mukuru/WorldRemit/WU named as dominant IMTOs (~67% inbound cited in commentary) | **Medium** | Useful for pilot timing; treat market-share % as soft. |

**No published “UK→ZW school-fee USD volume” found.** Treat education as a **high-frequency purpose**, not a measured TAM until RBZ/MTO tags or partner data exist.

**Founder gap:** Ask design-partner MTOs what % of ZW sends they already tag as education / school, and average ticket vs cash remittance.

---

## 3. Who already sells (or plans) ZW school-fee / purpose pay

### 3.1 Scorecard (public evidence)

| Player | UK→ZW remittance? | Explicit school-fee / purpose product for ZW? | What public product does | Relevance to Senda Connect |
| --- | --- | --- | --- | --- |
| **Mukuru** | Yes (major IMTO) | **No** clear school-fee SKU | Remittance; ZW bill/collections (DStv, utilities, vouchers); wallet bills (electricity, airtime, insurance). NewsDay (2025) contrasts EcoCash school payments vs Mukuru’s thinner bill set. | **Primary design-partner candidate.** Has biller-collections appetite; school fees would need Senda (or similar) for dues+proof. |
| **WorldRemit** | Yes | **No** for ZW schools | Bank, cash pickup, mobile money, airtime into ZW. Bill pay exists in *some* corridors (utilities etc.), not evidenced for ZW schools. | Rate competitor, not purpose competitor. Could consume Connect later if they add purpose SKUs. |
| **Remitly** | Yes | **Partial / generic** | Classic remittance to ZW. Oct 2026: “pay businesses” globally (tuition cited as use case, e.g. Mumbai) — add business as recipient; **not** a ZW school directory + due fetch. | Shows big-MTO direction toward purpose; still needs obligation/proof layer for schools. |
| **Western Union** | Yes | No dedicated ZW school product | Cash/wallet/bank; education is a *compliance purpose*, not a bill-pay product. | Low near-term Connect buyer. |
| **PayAngel** | Purpose remittance (UK etc.) | **Ghana schools**, not ZW | PayAngel Business: registered Ghanaian schools, payment links / D2MR, diaspora parents. | Pattern twin (school as biller + diaspora payer). Corridor mismatch for pilot; useful UX/comms comps. |
| **Vybe-class** | Purpose apps (e.g. Vybe → Kenya merchants/paybills) | **Not ZW** | Category-locked merchant-direct (school fees to paybill), receipt to phone. | Demand pattern Senda wants to enable for *partners*; Senda is the ZW allowlist/proof layer, not a consumer app. |
| **EcoCash** | Remittance + **Diaspora Wallet** (UK launch ~Jul 2026) | **Yes (claimed)** | Domestic school-fee payments; Diaspora Wallet: fund via card/Visa/Mastercard (+ Sasai for UK/SA), pay school fees / utilities / merchants with real-time confirmation. | **Consumer bypass threat** to MTOs *and* to Senda if EcoCash becomes the default “pay school from UK” path. Also a settle destination schools already use. |
| **Topa / ClicknPay / ClicknShare** | Purpose gateway + consumer app | **Yes — UK→ZW school fees marketed** | Topa: pay school directly, receipt both sides, term reminders. ClicknShare: one remitter API → many providers (incl. schools); settles + routes + KYC; pitches that per-biller bill-pay builds take a year. | **Direct category competitor / substitute.** Closest public articulation of the MTO pain Senda also targets — but they sell settlement + network, not `mto_settles` instruction/proof. |
| **NMB PaySchoolFees** | Domestic | Yes (local channels) | Find school → confirm due → pay; school portal; developer API: balance lookup, validate refs, invoices, transaction query. | **Supply-side rail / dues pattern**, not a UK MTO. Useful as settle/recon analog and possible future ERP-ish pull target. |
| **Paynow BillPay** | Domestic vendor/biller APIs | Billers generally; Auth→Pay | Vendor Auth/Pay, member numbers, webhooks, receipts — classic bill-pay. | **API shape reference** for Connect (fetch/auth before collect; pay/confirm after). |
| **Zikicash (CBZ)** | UK remittance product (commentary) | Not school-fee specific | Corridor competition for cash remit. | Low for Connect school wedge. |

### 3.2 Reading the map

- **Incumbent MTOs have distribution and settlement; they lack school Obligation hygiene + proof.** Mukuru’s own collections marketing (“choose biller, amount, account number”) is the skeleton of Connect — without student/term due truth.
- **Purpose specialists are attacking the same sender pain** (“send the reason, not just the money”) with full-stack settle. That validates demand; it does **not** validate that MTOs will outsource settlement to them vs keep settlement and buy a thin Connect.
- **EcoCash vertical integration** is the other path: wallet + merchant/school network + diaspora funding. MTOs lose the “last mile purpose” if EcoCash wins the sender relationship.

---

## 4. What partners need from Connect

Derived from: Senda product draft; ClicknShare remitter pitch; Paynow Auth/Pay; NMB PaySchoolFees; BBPS fetch-then-pay note in product spec. **Not** from partner interviews.

### 4.1 Must-have MVP (sell into first MTO / purpose app)

| Capability | Partner need | Senda object / surface |
| --- | --- | --- |
| **Resolve beneficiary** | Find school + student without storing every bursar WhatsApp thread | Link (open student+school); directory / `link_code` |
| **Fetch due at pay time** | Show payer what is owed before collecting GBP | Obligation validate / fetch |
| **Instruct + unique ref** | Settle with a reconcilable reference; freeze destination | Instruction: `customer_reference` + destination snapshot |
| **Idempotent collect** | No double-charge on retries | `idempotency_key` on instruct |
| **Confirm settlement** | Close the loop after they moved money | Confirm API / webhook ingest |
| **Proof** | Show school + payer + support that payment applied | Proof artifact (JSON + optional PDF) |
| **Sandbox + API key** | Integration without live money | Partner auth |

### 4.2 Should-have soon (pilot retention)

- Status poll + webhook events (`proven`, `needs_reconcile`, cancelled)
- Partial-pay / overpay rules at biller level (BBPS lesson)
- Stale Obligation flags (term window) so partners don’t sell dead dues
- Partner-facing attempt history for support
- Clear settle-instruction fields: bank USD vs EcoCash (whatever #10 locks)

### 4.3 Explicitly not Connect’s job (near term)

- Collect GBP / FX / float (partner does this)
- Guarantee school received funds if partner never settles
- Full school ERP replacement
- Open marketplace of unverified schools

### 4.4 Competitive API bar (ClicknShare-shaped)

ClicknShare markets: one Sending Node API, sandbox in a day, FX+routing+settlement handled, receipts both ways, white-label optional.  

**Senda counter-offer to an MTO that already settles:** keep your licence, float, and FX — buy **allowlisted dues + refs + recon proof** so “pay school fees” ships without onboarding every school into *their* ops. If the partner wants Senda to settle, that is a product objection (see §5), not the default doctrine.

---

## 5. Killer objections (demand-side)

| Objection | Why it kills / slows a deal | Mitigations in Senda doctrine | Interview needed? |
| --- | --- | --- | --- |
| **“We want you to settle / hold float.”** | Turns Senda into adaptor-as-payer; capital + licence path | Stick to `mto_settles`; prove value on instruct+proof alone | **Yes** — ask Mukuru-class explicitly |
| **“We need ERP-perfect live balances.”** | Blocks launch if schools only have Excel / term templates | Obligation ledger + templates + exceptions; ERP pull later | **Yes** — what accuracy % is “good enough”? |
| **“Coverage too thin (5–10 schools).”** | App SKU feels empty vs EcoCash/Topa marketing | Pilot as closed partner catalogue; density roadmap | **Yes** — minimum school count for SKU |
| **“Liability if due was wrong.”** | Partner fear of chargebacks / reputation | Validate + stale flags + school owns Biller hygiene; clear contract language | **Yes** |
| **“We’re already talking to ClicknShare / building in-house.”** | Substitute | Differentiate: partner keeps settlement; Senda is purpose-settlement proof layer; multi-partner network density | **Yes** |
| **“EcoCash Diaspora Wallet already does school fees.”** | Sender may skip MTO | MTO value = existing trust/funding rails + proof into *their* app; school KYB quality vs EcoCash merchant messiness | **Yes** (sender + school side) |
| **“Confirmations won’t match / recon will be ops hell.”** | Support cost | Exact match MVP (ref+amount+currency); `needs_reconcile` queue; dogfood first | Soft |
| **“Pricing unclear.”** | Procurement stall | Decision #3: instrument usage first; defer Connect fees | Soft |
| **“White-label whole stack or nothing.”** | Scope explosion | Dogfood + Connect API only; refuse white-label remittance core | Soft |

---

## 6. Confidence & sources

### Confidence by claim cluster

| Cluster | Confidence | Notes |
| --- | --- | --- |
| UK→ZW remittance magnitude | **High** | RBZ corridor tables |
| Education is a major remittance purpose | **Medium** | Survey + seasonality; no volume tag |
| MTO ZW school-fee SKU gap | **High** | Public product pages |
| Purpose-app demand for “pay school directly” | **High** | Topa, EcoCash Diaspora, PayAngel (GH), Vybe (KE) |
| MTO willingness to integrate Connect (`mto_settles`) | **Low** | No interviews |
| Connect MVP feature set | **Medium** | Convergent industry patterns + Senda locked product |
| Competitive threat ranking | **Medium** | Public positioning only |

### Primary sources (public)

- RBZ remittance-by-corridor tables (via Zimbabwe Embassy DC diaspora page)
- World Bank Remittance Prices Worldwide — UK→ZW Q3 2025
- ONS Census 2021 Zimbabwe-born (England & Wales)
- Mbiba & Mupfumira — *Rising to the occasion…* (PMC9359510) — purpose mix
- Mukuru Bill Payment / Mukuru Pay / ZW wallet help docs
- NewsDay / EcoCash — school payments vs Mukuru feature gap (2025)
- EcoCash Diaspora Wallet launch coverage (Business Times, newZWire, Good4Zim — Jul 2026 UK)
- Remitly Newsroom — pay businesses (6 Oct 2026)
- WorldRemit ZW product pages; iCompareFX bill-pay summary
- PayAngel Business schools (Ghana)
- Vybe.ke purpose-locked payments
- Topa.click + ClicknShare.co.uk (school fees + remitter API pitch)
- NMB PaySchoolFees (+ developer overview)
- Paynow BillPay Vendor Auth/Pay docs
- Industry commentary: back-to-school remittance peak (Sitemere); ClicknPay TechnoMag

---

## 7. Founder-interview gaps (do not invent answers)

Prioritised outreach list for design-partner discovery (Decision #4: parallel outreach; none named yet):

1. **Mukuru (or equivalent major ZW IMTO):** appetite for school-fee SKU; settle-themselves vs buy gateway; minimum school coverage; Auth/Pay-like API expectations; who owns school KYB.
2. **Remitly / WorldRemit corridor or product lead:** whether “pay business” will deepen into ZW education with dues fetch, or stay free-text business pay.
3. **Purpose app (Vybe-class / PayAngel-class):** would they plug a ZW Connect for schools rather than build school graph themselves?
4. **Topa/ClicknShare competitive intel (careful):** what schools are live; remitter pipeline; whether their moat is settlement or directory — informs whether Senda is complement or clash.
5. **2–3 UK diaspora parents who pay ZW private fees:** current path (Mukuru→relative→bursar vs EcoCash vs Topa vs bank); receipt failures; what “proof” means to them.
6. **1–2 ZW private-school bursars:** how diaspora fees arrive today; reference quality; EcoCash vs USD bank preference (feeds #10).

Until these land, **do not treat any named MTO as committed**.

---

## 8. Implications for locking stack #9

**#9 LOCKED (preferences): Next.js + TypeScript + Postgres; Biller beside school systems; no NN day-one.** Demand research **supports** that lock for the first 90 days, with a few non-negotiable capabilities.

### 8.1 What #9 must support because of Connect demand

| Requirement from demand | Stack implication | Day-one? |
| --- | --- | --- |
| Partner API: validate / instruct / confirm / proof | First-class HTTP API (Next.js Route Handlers or thin API layer) + API-key auth | **Yes** |
| Idempotent instruct + unique `customer_reference` | Postgres uniqueness constraints; transactional attempt creation | **Yes** |
| Fetch-at-pay Obligations | Relational Obligation model; versioning/stale flags — not a data lake | **Yes** |
| Confirm ingest + recon | Durable write path; status machine; ops queue for `needs_reconcile` | **Yes** |
| Proof for partner + school | Object storage (S3-compatible) for PDF/JSON artifacts; signed URLs | **Yes** |
| Sandbox partner | Separate keys/env; fixture schools | **Yes** |
| Webhooks to partners (soon) | Outbox / retry queue (can be DB-backed initially) | **Soon** (design for it) |
| ERP / ZivoFees / Makronexus pull | Connector framework later | **No** — templates + CSV onboarding only |
| Senda settlement / FX / float | Payment-orchestrator complexity | **No** — contradicts `mto_settles` |
| Neural matching of messy bank narratives | ML stack | **No** — allowlist + exact recon |

### 8.2 Lock recommendation (demand-side) — accepted / #9 LOCKED

- **Lock Next.js + Postgres** as sufficient for Connect + Biller + dogfood: one deployable app, strong relational integrity for refs/Obligations, fast partner sandbox.
- **Add to the #9 lock text (explicit):** (1) object storage for proofs, (2) idempotency + unique customer references enforced in DB, (3) webhook/outbox path planned even if partner webhooks ship after confirm-API, (4) no payment-orchestrator / PSP core in MVP.
- **Do not delay #9 for:** multi-region data residency unknowns, ERP connectors, or white-label remittance platforms — none are required to test MTO demand.
- **Revisit #9 only if** a named design partner requires SOAP/legacy bill-pay protocols or on-prem — unlikely for UK digital MTOs; flag if Mukuru integration dictates otherwise (**interview gap**).

### 8.3 Demand → wedge → stack chain

```
UK→ZW remittance scale + education purpose
        → MTO/purpose apps need school SKU without per-school builds
        → Connect = fetch due + instruct/ref + confirm + proof (mto_settles)
        → Stack #9 = API + Postgres ledger + proof objects (+ later webhooks)
        → Not #9 = settle rails core, ERP day-one, NN recon
```

**Bottom line for coordinator / lock-brief:** Demand side does **not** block locking #9 to Next.js + Postgres. It **does** require the Connect contract (validate → instruct → confirm → proof) and proof storage to be first-class in that stack — and founder outreach to test whether MTOs accept `mto_settles` vs settlement-gateway substitutes (ClicknShare/EcoCash).
