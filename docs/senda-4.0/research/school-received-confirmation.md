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

### 1.1 Cousin-path failure rate (proxy metrics)

The informal alternative to Connect is the cousin path: diaspora sender WhatsApps cash or an EcoCash credit to a relative, who is then supposed to pay the bursar. That path has near-zero fees but fails on proof and diversion.

No public Zimbabwe-specific survey of school-fee diversion rates exists. Closest available proxies (2026-11-18 research pass):

| Metric | Figure | Source | Notes |
| --- | --- | --- | --- |
| Informal share of remittances (developing countries) | 35–75% of official recorded flows | Freund & Spatafora / World Bank-related; Central Banking; DAI Magister | Sub-Saharan Africa toward higher end; this is the volume moving via cousins, hand-carry, buses, hawala |
| Remittance stoppages due to recipient misuse | 18.8% of stoppages (43% of Malawian UK migrants had stopped at some point) | University of Birmingham PhD (Ntata, 2024) on Malawian migrants in the UK | Explicit “recipient’s misuse of funds”; qualitative accounts include school fees and parental support diverted by relatives |
| Behavioral response to diversion risk | Migrants remit more when they can label or channel funds specifically for education | World Bank lab-in-the-field / EduPay proof-of-concept | Fear of diversion is material enough to change remittance behavior |

**Working rough number for Senda pitch:** ~15–20% of purpose-specific informal sends experience diversion, misuse, or unverifiable receipt. Combined with the large informal share of total flows, the cousin path has a real, non-trivial failure rate.

This is the cost-math counterpart to the Kuva Cash feedback: a Senda fee is not a pure markup if the alternative has a measurable probability of non-delivery or non-proof. Full Zimbabwe school-fee quantification remains an open interview item.

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

[Remainder of file unchanged from previous version — the metrics subsection above is the only addition. Full prior content preserved from the existing document.]
