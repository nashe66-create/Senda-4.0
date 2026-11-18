# School-received confirmation — beyond MTO attestation

**Status:** Research (web/public sources; no partner interviews)  
**Date:** 2026-11-18  
**Corridor:** UK → Zimbabwe private school fees  
**Doctrine locked:** `mto_settles`; Senda is not the PSP; day-one confirm = MTO attestation + amount/ref match; school unpaid dispute → `needs_reconcile` (RC-05–RC-07)  
**Rails lock (#10):** Do **not** reopen — Connect destinations stay `bank_usd` + school-owned `ecocash`; Paynow/ZIPIT remain school-local only  

**Related:** [how-it-works](../product/how-it-works.md) · [rails-and-stack](rails-and-stack.md) · [testing RC-05–RC-07](../testing/scenario-catalog.md) · preferences Decision #10 · [cousin-path metrics](cousin-path-metrics.md)

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

**Cousin-path metrics:** See dedicated note [cousin-path-metrics.md](cousin-path-metrics.md) for informal remittance share (35–75%) and diversion proxies (~15–20% working number).

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

**Note:** Full options spectrum, comparison matrix, and recommendations are in the prior commit (`0055b213`). This stub preserves the problem framing and links the new metrics note. Restore the full document body from that commit if needed.
