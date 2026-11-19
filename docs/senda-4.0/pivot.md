# Senda 4.0 — The pivot

**From:** a consumer remittance app that moves money (Senda 3.0).  
**To:** B2B infrastructure that makes **purpose payments** (school fees as the first wedge, then medical/utilities and other billers) verifiable, attributable, and provable — while **remittance partners move the money**.

---

## What we were building (3.0)

- UK diaspora **grouped transfers** (one plan → N payouts)
- Senda (via Fincra/Flutterwave) handled **collect → FX → payout**
- Differentiation hoped to be multi-recipient UX, ledger, fees
- Reality: that hygiene is **not a moat** vs large remittance brands (e.g. Remitly / WorldRemit / Mukuru as market context — not product identity)

---

## What we’re building (4.0)

**Senda 4.0** = verified **purpose-settlement network**

| Surface | Buyer | Job |
| --- | --- | --- |
| **Connect** | Remittance / purpose-pay partners (and banks) | Validate organisation + person → get pay instructions + payment reference → confirm → **payment proof** |
| **Biller** | Organisations (schools first; then clinics, utilities…) | Organisation checks, pay codes, refs, payment visibility, receipts |
| **Network** | Density between them | Shared allowlisted organisations + pay codes |

**Doctrine:** Connect = **instruction + proof**. Prefer **`mto_settles`**. Avoid adaptor-as-payer / competing on FX. Product copy stays **generic partner / biller** — named remittance brands are examples only.

---

## The problem (why pivot)

Diaspora money for school fees (and other purpose bills) usually goes **person → person → organisation**. That causes diversion, fake-account fraud, bursar mismatch, and no proof. Remittance partners are adding business/bill pay but still lack a **neutral allowlisted pay-code layer** (payer ↔ person ↔ organisation) with validation, payment references, and reconciliation — without becoming a marketplace or running bursar ops.

---

## What we stop owning

- Being “another Remitly” on rates/speed  
- Core dependence on Flutterwave/Fincra as the product  
- Open goods & services marketplace  
- Adaptor-as-payer as the company (float, FX, licence)

## What we start owning

- Organisation checks (KYB) + directory  
- Pay codes (Links) + payment references  
- Amount-due validation (`Obligation` in the system model)  
- Confirmation ingest + three-way recon  
- Payment-proof artifacts partners and organisations can trust  

---

## Who moves money?

**The partner (default).** A remittance / purpose-pay partner collects, converts, and pays the organisation’s verified account/till using Senda’s instructions. Senda reconciles their confirmation into proof. Local PSPs (EcoCash, Flutterwave, etc.) are optional last-mile only if the partner cannot reach the destination — not the core business.

---

## First wedge

**UK → Zimbabwe private school fees** (first biller type — not the product limit)  
5–10 schools → pay codes → partner (or test loop) settles with Senda payment reference → recon → proof.  
Then sell the same network into more remittance and purpose partners (by onboarding organisations for them). Nigeria and other corridors are later expansion only.

---

## One sentence

**Senda 4.0 doesn’t win by sending money cheaper — it wins by being the layer that proves the right organisation and person got paid for the right amount due.**
