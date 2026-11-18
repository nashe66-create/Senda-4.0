# School-received confirmation — beyond MTO attestation

**Status:** Research (web/public sources; no partner interviews)  
**Date:** 2026-11-18  
**Corridor:** UK → Zimbabwe private school fees  
**Doctrine locked:** `mto_settles`; Senda is not the PSP; day-one confirm = MTO attestation + amount/ref match; school unpaid dispute → `needs_reconcile` (RC-05–RC-07)  
**Rails lock (#10):** Do **not** reopen — Connect destinations stay `bank_usd` + school-owned `ecocash`; Paynow/ZIPIT remain school-local only  

**Related:** [how-it-works](../product/how-it-works.md) · [rails-and-stack](rails-and-stack.md) · [testing RC-05–RC-07](../testing/scenario-catalog.md) · preferences Decision #10  

---

## 1. Problem: MTO confirm ≠ bursar received

Connect’s day-one happy path:

1. Validate Obligation → instruct (frozen `bank_usd` or school EcoCash + unique ref)  
2. MTO settles and posts confirm  
3. Senda recon: ref + amount + currency → `proven`  
4. School unpaid / false-confirm dispute → `needs_reconcile` (RC-06, RC-07)

That is **attestation from the sender-side partner**, not a ledger event on the school’s bank or wallet.

Why that gap matters for ZW private schools:

| Failure mode | What happens | Product risk |
| --- | --- | --- |
| **Partner “paid” ≠ credited** | WorldRemit-class “Paid” can mean funds handed to a *local payout partner*, not yet available to the recipient.[^wr-paid] | False `proven`; bursar still unpaid |
| **Ref never lands on statement** | Remittance bank credits often surface the *partner’s* transfer id, not Senda’s `customer_reference` (already noted in rails research) | Statement match fails even when money arrived |
| **Wrong destination / diversion** | Credit to relative EcoCash, wrong account title, truncated account | School never sees funds; partner may still attest |
| **Timing** | Bank USD 1–3 WD; EcoCash often faster but amount-capped | “Unpaid” dispute during settle window looks like fraud |
| **No clearing-house** | Unlike BBPS, there is no CU that irrevocably confirms biller posting before the payer receipt[^bbps-guidelines] | Senda cannot copy India’s settlement guarantee |

**Trust ladder (use throughout):**

| Level | Meaning | Example |
| --- | --- | --- |
| **L1 Attest** | A party asserts receipt/send | MTO confirm; bursar “mark received” |
| **L2 Evidence** | Attest + artifact (SMS, PDF statement line, screenshot) | School upload + ops review |
| **L3 Ledger feed** | Credit line from bank/wallet system of record | MT940/CAMT; EcoCash merchant report; AIS |
| **L4 Network confirm** | Rail-level “credited to beneficiary” (UETR/gpi ACCC-class) | SWIFT gpi tracker; FedNow ACCC analogy |
| **L5 Cryptographic / on-chain** | Independent verifiable settlement | Stablecoin tx hash (not realistic for ZW schools now) |

Day one is **L1**. This paper maps paths to **L2–L4** without becoming a PSP or reopening #10.

---

## 2. Options spectrum

For each option: how it works · data needed · trust · latency · school burden · partner burden · regulatory/privacy · MVP (≤90 days) vs later.

### 2.1 Bank statement / open banking / PSD2-style (UK) + ZW bank feeds

**How it works**

- **UK (payer / funding side):** PSD2 AIS can prove the *payer* funded the MTO — useless for “school received.” UK open banking does not see ZW nostro credits.
- **ZW beneficiary side:** Prove credit on the school’s USD FCA / business account via:
  - Corporate internet banking **PDF/CSV export** (manual or RPA) — e.g. FBC OBDX statement download[^fbc-obdx]
  - **MT940 / CAMT.053/.054** end-of-day or credit notification where the bank supports SWIFT cash management — Stanbic Zimbabwe lists MT940, camt.052/054, and **Swift gpi** membership[^stanbic-swift]
  - Bank **REST APIs** where offered (e.g. Steward / TN CyberTech “open banking” style transaction APIs)[^steward-api]
  - Vendor claims of ZW “open banking” recon (treat as commercial, verify bank-by-bank)[^mutual-africa]

**Data needed:** School account number + bank; consent / corporate API keys or SWIFT BIC relationship; expected amount, currency, value-date window, remittance/ref candidates (Senda ref + partner payment id).

**Trust:** L3 if feed is bank-signed or bank-API; L2 if school-uploaded PDF.

**Latency:** Same-day to T+1 for EOD MT940; intraday rare outside large corporates.

**School burden:** High for API onboarding (IT + bank forms); medium for weekly CSV/PDF upload; low once feed is live.

**Partner burden:** Low (no change to settle rail). Optional: pass bank UTR / partner ref in confirm payload to aid matching.

**Regulatory / privacy:** School is data controller of its own statements; Senda needs contractual purpose limit (recon only), retention, and access control. No ZW PSD2-equivalent mandate — connectivity is bilateral.

**MVP-fit:** **Partial.** Manual statement upload + ops match for disputed Attempts = 90-day feasible. Automated MT940/API = **phase 2+** per pilot bank.

---

### 2.2 SWIFT gpi / UETR / MT940 / CAMT

**How it works**

- Cross-border MT103-class payments carry a **UETR**; gpi Tracker can show status through to **beneficiary credit confirmation** when banks in the chain are gpi-capable.[^uetr][^gpi-mcb]
- Destination-bank **MT940** (EOD) or **camt.054** (debit/credit notification) gives the statement line Senda would match.[^stanbic-swift][^citi-alibaba]

**Data needed:** UETR from originating / payout bank (usually *not* exposed to Senda today unless MTO or correspondent shares it); school BIC + account; statement subscription.

**Trust:** L4 for gpi “credited”; L3 for MT940/CAMT lines.

**Latency:** Minutes–hours on gpi corridors; EOD for MT940.

**School burden:** Low if bank already publishes statements to a treasury mailbox; high if school must request SCORE/FileAct setup.

**Partner burden:** **High** — MTO must surface UETR / bank reference on Connect confirm. Most consumer remittance APIs do not document this today.

**Regulatory:** Standard banking secrecy / school consent.

**MVP-fit:** **Later (phase 3).** Excellent long-term for `bank_usd` term fees; blocked on partner + bank product access. Do not block MVP on gpi.

---

### 2.3 EcoCash merchant statement / till API / SMS–USSD / email forward

**How it works**

| Sub-option | Mechanism | Feasibility |
| --- | --- | --- |
| **Merchant Open API** | Charge + lookup + `notifyUrl` callbacks; transactionId / referenceCode[^ecocash-dev][^eip] | Built for **C2B merchant charge** (school pulls from payer wallet), **not** for inbound remittance wallet credit from an MTO. Useful if school is merchant *and* payment is merchant-pay; weak for “MTO credited school wallet.” |
| **Partner / self-service portal statements** | EcoCash portals advertise statement generation / reconciliation tracking for partners[^ecocash-bulk][^partner-portal] | **Most practical L3-ish** for school-owned wallets: export daily credits, match amount + time + MSISDN/ref |
| **SMS / USSD parse** | Customer/merchant SMS contains amount, merchant name, reference[^eip-sms] | Fragile (format drift, multi-currency, spoofing). Use as **L2 evidence**, never sole auto-prove |
| **Email / WhatsApp forward** | Bursar forwards credit SMS/email to a Senda ingest address | Low-tech L2; good pilot UX |

**Data needed:** School merchant code / MSISDN; ownership proof (already KYB); expected amount/currency; optional clientCorrelator if Senda ever initiates merchant charge (out of Connect doctrine for `mto_settles`).

**Trust:** Portal/API settlement report ≈ L3; SMS forward ≈ L2; SMS alone ≠ cryptographic.

**Latency:** Instant to minutes for wallet credit; portal export often batch (same day / 48h for some bulk products).[^ecocash-bulk]

**School burden:** Low–medium (forward SMS or download CSV). API credentials = medium.

**Partner burden:** Low if destination is school EcoCash; partner should put Senda ref in payout narrative where EcoCash allows.

**Regulatory:** MSISDN + transaction logs are personal/business data; store minimally; prefer merchant institutional wallet over staff personal phone (already #10 policy).

**MVP-fit:** **Yes — L2 SMS/email forward + optional CSV upload** for EcoCash destinations. Merchant API as *inbound credit oracle* = **phase 2** after EcoCash partnership clarifies credit-notification APIs for remittance credits (distinct from C2B charge).

---

### 2.4 Paynow / Zimswitch settlement reports (even if not Connect destinations)

**How it works**

Paynow posts hashed status updates (`Paid`, etc.) and supports poll URLs; local methods settle ~T+1 to the merchant’s ZW bank; verified merchants settle daily.[^paynow-status][^paynow-faq] Zimswitch appears as an Express Checkout method, not a remittance payout target.[^paynow-express]

**Relevance to Connect:** Per #10, Paynow/ZIPIT are **school-local**, not MTO instruct destinations. Still useful as:

1. **Parallel signal** when a school also collects local fees via Paynow (external payment logging).  
2. **Pattern library** for webhook + poll + hash verification (copy into Connect confirm design).  
3. **Secondary recon** if an MTO somehow pays via a local aggregator (non-standard; do not design for this).

**Trust:** L3 for Paynow “Paid” *to merchant* (still not bank-posted until settlement day).

**MVP-fit:** **Out of Connect MVP.** Optional phase 2 for Biller “external payment” import. Do not reopen #10.

---

### 2.5 Virtual account / unique account-per-Obligation (NUBAN-like)

**How it works**

Nigeria-style **dedicated virtual accounts** assign a unique account number per customer (or invoice); inbound transfers auto-match via webhook (`charge.success`).[^paystack-dva] That pattern is the gold standard for “prove credit without reading narrative.”

**ZW reality:** No public NUBAN-equivalent product from major ZW banks for school-fee collectors was found in this pass. Schools use **one** nostro/FCA and/or one EcoCash till. Creating Senda-controlled virtual accounts would pull Senda toward **collecting** (PSP / `senda_settles`) — **explicit non-goal**.

**Viable ZW-shaped variants (later):**

- Bank **sub-account / collection account** per school (still one school owner) + strong refs  
- Partner-issued **payout reference** that always appears on statement  
- If a ZW bank launches VA products, evaluate as **school-owned** VA under KYB — not Senda omnibus

**Trust:** L3–L4 when VA provider webhooks credit events.

**MVP-fit:** **No** for ZW in 90 days. Keep as **phase 3 corridor expansion** lesson (NG) / watch-list if a ZW bank ships VAs.

---

### 2.6 Unique amount + ref “steganography” / amount watermarking

**How it works**

Two related ideas often confused:

1. **Unique structured reference** (ISO 11649-style / opaque `customer_reference`) — **already in Senda MVP.** Best practice: reference selects the Obligation; amount+currency validate.[^oxapay-ref][^xtransfer-ref]  
2. **Amount watermarking** — encode identity in cents (e.g. fee $450.00 → instruct $450.17) so statement amount alone matches when ref is stripped.

**ZW/MTO practicality:**

- Remittance UIs and FX rounding often **alter cents**; EcoCash/bank fees may debit net ≠ instructed gross.  
- Term fees cluster (many students same amount) → watermark collisions unless globally unique and reserved.  
- Ref stripping is common (PC-05 in testing pack: partner cannot pass custom bursar string).

**Recommendation:** Keep **exact amount + ref** as primary. Use **cent watermark only as optional secondary key** when (a) partner confirms they can pay exact cents, (b) no FX fee deduction on the credit line, (c) watermark namespace reserved per Attempt. Prefer dual recon: Senda ref **or** partner_payment_id **or** (amount+value-date+destination) with ambiguity → `needs_reconcile`.

**Trust:** L2–L3 when combined with statement line; amount-only = weak.

**MVP-fit:** **Ref uniqueness = yes (already).** Cent watermark = **phase 2 experiment**, not default.

---

### 2.7 School-side “mark received” + evidence upload + attestation (human-in-loop)

**How it works**

Biller action on an Attempt after partner confirm (or during settle window):

- `school_mark_received` → strengthens proof (still L1/L2)  
- `school_mark_unpaid` / dispute → `needs_reconcile` (**RC-07**, already specified)  
- Optional **evidence:** statement PDF crop, EcoCash SMS screenshot, bank POP — stored in S3-compatible proofs store

Aligns with existing confirmation ingest modes: `partner_api` / `manual_ops` / `school_mark`.[^rails-mvp]

**Data needed:** School auth; attempt_id; optional file + attestation checkbox (“I confirm funds appear on school bank/EcoCash”).

**Trust:** L1 alone; **L2** with evidence; never auto-overrides a conflicting bank feed later without ops.

**Latency:** Human (hours–days). Acceptable for dispute path and early pilot volume.

**School burden:** Low if only on disputes / sampling; high if required for every `proven`.

**Partner burden:** None.

**Regulatory:** Evidence may contain account numbers — redact in UI where possible; retention policy.

**MVP-fit:** **Yes — highest leverage.** Ship dispute + optional evidence on `school_mark`; do **not** require school attestation for every happy-path `proven` (kills bursar adoption).

---

### 2.8 Crypto / stablecoin settlement

**How it works (theory):** USDT/USDC remittance → school wallet → on-chain proof (L5).

**ZW reality:**

- VA use is largely **informal P2P**; banks warned off facilitating crypto without a framework.[^fiu-va]  
- RBZ fintech sandbox **excludes cryptocurrency / digital currency**.[^carnegie-sandbox]  
- No evidence private schools accept stablecoins as bursar settle destinations.  
- Would reopen rails and PSP/VASP questions.

**MVP-fit:** **Reject for Connect destinations.** Monitor only; do not design.

---

### 2.9 Account aggregation (Plaid-class) for ZW

**How it works elsewhere:** Consent-based AIS (Plaid US/UK/EU; Mono/Okra/Stitch in NG/KE/GH/ZA).[^plaid-countries][^mono]

**ZW:** Plaid does **not** list Zimbabwe for Transactions/Auth. African aggregators publicly emphasize NG/KE/GH/ZA — **not ZW** in this research pass. Mutual Africa Pay claims ZW bank connections — verify empirically before architecture dependence.[^mutual-africa]

**India AA lesson:** Consent artefact, FIPs as source of truth, AA cannot store data, differences resolved to provider books.[^rbi-aa] ZW has no equivalent regulated AA network.

**MVP-fit:** **No.** Revisit if a credible ZW AIS vendor covers Steward/CBZ/Stanbic/FBC with school corporate consent.

---

### 2.10 Partner payout webhooks + bank credit webhooks

**How it works**

| Signal | What it proves | Gap |
| --- | --- | --- |
| **MTO confirm / webhook** | Partner believes payout initiated or paid to local rail | May be pre-credit ([^wr-paid]) — **L1** |
| **Payout partner bank credit webhook** | Rare; would be L3 if school’s bank notifies Senda | Needs bank product |
| **Visa Direct Query API** | OCT push status / action codes[^visa-direct] | Relevant only if payout is card-push; not typical school nostro |
| **FedNow ACCC / RTP analogy** | Explicit “posted to creditor account”[^fednow] | **No ZW equivalent** today; use as *product language* for future bank APIs (“we want ACCC-class, not ACTC-class”) |

**MVP-fit:** Keep Connect confirm as L1; **require partners to document semantic** of `settled_at` (sent to partner vs credited to beneficiary). Phase 2: ingest richer status enums (`sent_to_rail` | `credited_beneficiary` | `failed`).

---

### 2.11 Matching engines (fuzzy statement line matching)

**How it works**

Ordered hierarchy (industry practice):[^asima]

1. Exact Senda `customer_reference` in remittance  
2. Exact `partner_payment_id` / bank UTR  
3. Exact amount + currency + destination + bounded value-date window (unique candidate only)  
4. Fuzzy narrative (Levenshtein / token overlap on school name, student name) → **review only**  
5. Ambiguity → `needs_reconcile` (never silent first-hit)

**Neural nets:** Explicitly **out of day one** (#9 / preferences). Rules + ops queue first.

**False positive controls:** Idempotent match keys; dual-match collision = exception; school dispute always reopens.

**MVP-fit:** **Exact match only** (already planned). Fuzzy = **phase 2** behind feature flag for statement imports.

---

### 2.12 Newer tech mapped to ZW (AA, BBPS, Visa Direct, RTP/FedNow)

| Pattern | What to steal | What not to copy | ZW mapping |
| --- | --- | --- | --- |
| **BBPS** | Fetch-then-pay; bind fetch→pay refs; biller posting expected on pay success; txn status check[^bbps-tech][^bbps-guidelines] | Clearing-house settlement guarantee; irrevocable payer receipt as legal proof of biller post | Already in how-it-works; **cannot** promise biller post without school/bank signal |
| **India AA** | Consent artefact; FI books authoritative; purpose-bound share[^rbi-aa] | Build Senda-as-AA | Use consent language for future statement feeds |
| **Visa Direct Query** | Explicit pending (HTTP 202) vs approved action codes[^visa-direct] | Assume OCT to school cards | Status machine clarity for partner confirms |
| **FedNow ACCC** | Separate “accepted” vs “posted to creditor”[^fednow] | Expect ZW RTP | Ask banks/MTOs for **posted** vs **submitted** in APIs |
| **Paystack DVA** | Credit webhook = match[^paystack-dva] | Senda omnibus accounts | Watch ZW bank VA roadmaps |

---

## 3. Comparison matrix (summary)

| Option | Trust | Latency | School burden | Partner burden | 90-day MVP? | Phase |
| --- | --- | --- | --- | --- | --- | --- |
| MTO attest + ref/amount (baseline) | L1 | Minutes | None | Low | **Yes (locked)** | MVP |
| School mark unpaid / received + evidence | L1–L2 | Hours–days | Low–med | None | **Yes** | MVP |
| EcoCash SMS/email forward or CSV | L2–L3 | Minutes–day | Low | Low | **Yes (pilot)** | MVP→P2 |
| Bank PDF/CSV upload + exact match | L2–L3 | Day | Med | Low | **Yes (disputes)** | MVP→P2 |
| Fuzzy statement matcher | L3 | Day | Low if feed exists | Low | No (rules only) | P2 |
| EcoCash merchant credit API | L3 | Minutes | Med | Low | Uncertain | P2 |
| ZW bank API / MT940 / CAMT | L3–L4 | Intra/EOD | High setup | Low–med | No | P2–P3 |
| SWIFT gpi / UETR | L4 | Minutes–hours | Low | High | No | P3 |
| Virtual accounts | L3–L4 | Instant | Med | Med | No in ZW | P3 / NG |
| Plaid/Mono-class AIS | L3 | Minutes | Med consent | None | No | Watch |
| Paynow settlement reports | L3 | T+1 | Low | N/A | No for Connect | Local only |
| Cent watermark | L2 | N/A | None | Med (exact pay) | Optional trial | P2 |
| Stablecoin | L5 theory | Fast | High / illegal-grey | High | **No** | Reject |

---

## 4. Recommendation (without reopening #10)

### MVP (ship with Connect confirm — still `mto_settles`)

1. **Keep day-one `proven` = MTO attest + exact amount/ref/currency** — do not block launch on bank feeds.  
2. **Ship RC-05–RC-07 paths hard:** fails-to-deliver never auto-proves; false confirm + school unpaid → `needs_reconcile`; school dispute always available.  
3. **Biller: `school_mark_received` / `school_mark_unpaid` + optional evidence upload** (SMS screenshot, statement crop) → L2 when sampled or disputed.  
4. **Confirm payload contract enrichment (docs + API fields, still L1):** `partner_payment_id`, optional `rail_status` (`submitted` \| `credited_beneficiary` \| `unknown`), optional `bank_reference` / EcoCash `transactionId` when partner has it. Semantic honesty > fake certainty.  
5. **Ops matching tool (dogfood):** paste/import one statement line or EcoCash CSV row → exact match Attempt; no NN.  
6. **Pilot sampling SLA:** e.g. first N pays per school require school `mark_received` or ops statement check before marketing “institution proof” externally — product honesty.

### Phase 2 (after first live loop)

- Automated **EcoCash merchant/partner statement pull** or scheduled CSV for `ecocash` destinations.  
- **Bank statement import** (CSV/MT940) for 1–2 pilot banks with highest school concentration (likely Steward/CBZ/Stanbic — validate in outreach).  
- Fuzzy matcher behind flag; dual-key recon (Senda ref **or** partner id).  
- Optional cent-watermark experiment on EcoCash only if partners can pay exact cents.  
- Richer partner webhook status machine (submitted vs credited).

### Phase 3

- SWIFT gpi / UETR where MTOs and correspondent banks expose it for `bank_usd`.  
- True bank credit webhooks / camt.054 if a ZW bank productizes it.  
- Virtual accounts only if **school-owned** and bank-supported — never Senda omnibus.  
- AIS aggregator only if ZW coverage becomes real.

### Explicit non-goals (stay locked)

- Do **not** make Paynow/ZIPIT Connect destinations.  
- Do **not** take settlement onto Senda balance sheets / crypto rails.  
- Do **not** require ERP or neural matching for proof.  
- Do **not** claim BBPS-style irrevocable biller posting on MTO attest alone.

---

## 5. Risks / false positives

| Risk | Why | Mitigation |
| --- | --- | --- |
| **Attest-proven, school unpaid** | Local partner lag; wrong wallet | RC-06/07; settle-window before aggressive `proven` UX; sampling |
| **Ref collision / reuse** | Bad generator or partner reuse | Opaque unique refs; reject replay; retain consumed refs[^oxapay-ref] |
| **Amount-only auto-match** | Many students same term fee | Require uniqueness in window or force review |
| **SMS spoof / edited screenshot** | L2 evidence forged | Treat as attest; escalate to statement; never sole legal proof |
| **Partner “Paid” semantics** | Pre-credit status[^wr-paid] | Status enum; docs; design-partner clarification |
| **FX / fee netting** | Credit $448.50 vs instruct $450 | Tolerance band only in `needs_reconcile` suggest — not auto-prove in MVP |
| **Privacy over-collection** | Full statements in S3 | Crop/redact; purpose limitation; school-controlled disconnect |
| **Cent watermark collision** | Two Attempts same watermark | Global reservation table or abandon watermark |
| **False `needs_reconcile` noise** | School marks unpaid during normal 1–3 WD bank lag | UI copy: settle window; countdown; disable dispute until window elapsed (configurable) |
| **Becoming de facto PSP** | VA / crypto / senda_settles creep | Keep destinations school-owned; #10 lock |

---

## 6. Founder outreach checklist (does not block MVP build)

1. Mukuru / Remitly / WorldRemit: meaning of confirm statuses; can they return **beneficiary-credited** vs submitted; EcoCash/bank **reference pass-through**; any UETR/UTR field.  
2. EcoCash (merchant/enterprise): inbound **remittance credit** notification API vs C2B charge only; statement export API for school merchant tills.  
3. 1–2 school banks (Stanbic / Steward / CBZ / FBC): MT940 or API for a school FCA; cost and lead time.  
4. 3 bursars: willingness to tap “received” + upload SMS on first-term diaspora pays.

---

## 7. Method & limits

- Public web research only (2026-11-18).  
- No bank/MTO/EcoCash contracts reviewed.  
- Vendor marketing (e.g. ZW “open banking” recon) marked unverified.  
- Does not change Decision #9 or #10.

---

## Sources

[^wr-paid]: WorldRemit FAQ — “Paid” means sent to local partner; funds may not yet be available to recipient. https://www.worldremit.com/en/faq/what-do-we-mean-when-we-say-your-transfer-is-paid  

[^bbps-guidelines]: Bharat Bill Payment System — Guidelines for Biller Integration (biller posting on payment success; CU receipt as consumer proof). https://www.bharat-connect.com/pdfs/notified-documents/BBPS-Guidelines-for-Biller-Integration.pdf  

[^bbps-tech]: BBPS Technical Standards v4.0 — fetch/pay binding, acknowledgements, TxnStatus. https://www.bharat-connect.com/strapi/uploads/BBPS_Technical_Standards_v40_52abd46ad9.pdf  

[^fbc-obdx]: FBC Internet Banking (OBDX) Corporate User Guide — statement PDF download. https://www.fbc.co.zw/sites/default/files/2024-05/OBDX%20CORPORATE%20USER%20GUIDE.pdf  

[^stanbic-swift]: SWIFT Bank Readiness — Stanbic Bank Zimbabwe Limited (MT940, camt.052/054, gpi). https://www.swift.com/products/bank-readiness-programme/bank-readiness-bank/standard-bank-south-africa/stanbic-bank-zimbabwe-limited  

[^steward-api]: TN CyberTech Bank / Steward — Open Banking API (payments, transactions, settlement reports). https://api.stewardbank.co.zw/  

[^mutual-africa]: Mutual Africa Pay — claimed ZW bank recon / open banking connections (verify). https://mutualafricapay.com/zw/banking-connections/  

[^uetr]: SWIFT — Unique End-to-end Transaction Reference (UETR). https://www.swift.com/payments/what-unique-end-end-transaction-reference-uetr  

[^gpi-mcb]: SWIFT case — MCB customer tracking via gpi Tracker / UETR. https://www.swift.com/swift-resource/251950/download  

[^citi-alibaba]: Citi / Alibaba — gpi + virtual accounts + MT940/MT942 recon. https://www.citibank.com/tts/case-studies/alibaba-swift.html  

[^ecocash-dev]: EcoCash Open API — developers portal. https://developers.ecocash.co.zw/  

[^eip]: EcoCash EIP Developer Guide — charge, lookup, notifyUrl, SMS contents. https://67even.github.io/ecocash-instant-payment-api/api-reference/  

[^eip-sms]: EcoCash EIP — SMS notifications fields. https://67even.github.io/ecocash-instant-payment-api/reference/documentation-tab/  

[^ecocash-bulk]: EcoCash Bulk Payments proposal — self-service portal statement generation / reports. https://zapf.co.zw/wp-content/uploads/2024/02/EcoCash-Bulk-Payments-Proposal-.pdf  

[^partner-portal]: EcoCash partner applications / self-service portal. https://partnerapplications.ecocash.co.zw/  

[^paynow-status]: Paynow Developer Hub — Status Update. https://developers.paynow.co.zw/docs/paynow/status_update/  

[^paynow-faq]: Paynow Merchant FAQ — settlement timing. https://www.paynow.co.zw/home/merchanttutorial  

[^paynow-express]: Paynow — Express Checkout methods (incl. zimswitch). https://developers.paynow.co.zw/docs/paynow/express_checkout_transactions/  

[^paystack-dva]: Paystack — Dedicated Virtual Accounts. https://paystack.com/docs/payments/dedicated-virtual-accounts/  

[^oxapay-ref]: OxaPay glossary — Reference-based payment matching. https://oxapay.com/blog/glossary/reference-based-payment-matching/  

[^xtransfer-ref]: XTransfer — automated reference number generation for reconciliation. https://www.xtransfer.com/newsroom/architecting-seamless-reconciliation-the-mechanics-of-automated-reference-number-generation-for-payments  

[^rails-mvp]: Senda 4.0 rails-and-stack — confirmation ingest modes include `school_mark`. `docs/senda-4.0/research/rails-and-stack.md`  

[^fiu-va]: Zimbabwe FIU — 2024 Virtual Assets Risk Assessment. https://www.fiu.co.zw/wp-content/uploads/2025/05/2024-Virtual-Assets-and-Virtual-Assets-Service-Providers-Risk-Assessment.pdf  

[^carnegie-sandbox]: Carnegie Endowment — Zimbabwe fintech sandbox excludes crypto. https://carnegieendowment.org/research/2024/02/sandbox-or-quicksand-an-analysis-of-zimbabwes-fintech-regulatory-sandbox  

[^plaid-countries]: Plaid — products by country/region (no ZW Transactions). https://support.plaid.com/hc/en-us/articles/27895826947735-What-Plaid-products-are-supported-in-each-country-and-region  

[^mono]: Mono — African open banking (NG/KE/GH/ZA emphasis). https://www.mono.co/  

[^rbi-aa]: RBI Master Directions — Non-Banking Financial Company – Account Aggregator. https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=10598  

[^visa-direct]: Visa Developer — Visa Direct how-to / Transaction Query. https://developer.visa.com/docs/visa_direct/docs-how-to  

[^fednow]: FedNow readiness — funds availability; confirmation of posting. https://explore.fednow.org/resources/readiness-guide-fund-availability.pdf  

[^asima]: Asima — Open banking payment reconciliation control architecture. https://asima.co.uk/blog/open-banking-payment-reconciliation/  

---

*End research. Feed product/recon design; do not reopen #10 rails lock.*
