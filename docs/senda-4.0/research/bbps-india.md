# Bharat Connect (BBPS) — how it works, including schools

**Studied:** 18 November 2026  
**System:** Bharat Bill Payment System, rebranded **Bharat Connect** on 29 August 2024  
**Operator:** NPCI Bharat BillPay Limited (NBBL), a wholly owned subsidiary of NPCI, authorised as the Bharat Bill Payment Central Unit (BBPCU)

Bharat Connect is the RBI payment system for bills and other receivables in India. A customer can pay any onboarded biller from any participating bank, app, or cash agent, get a receipt immediately, and the biller is paid later by guaranteed net settlement.

It is the switch and the clearing house. It is not the customer’s UPI app, and it is not a marketplace.

This note is a reference for Senda 4.0. Senda’s first wedge is UK → Zimbabwe school fees, and the doctrine is instruction plus proof while the partner moves the money. Bharat Connect is the closest national system that already does school fees, and it settles the money itself.

---

## How a school fee moves

A school does not apply to NPCI. It becomes a biller in the **Education Fees** category through a biller operating unit, often with its ERP vendor or a biller aggregator in front of that unit. Once it has a biller id, every bank and UPI app on the network can collect for it. The school integrates once.

Education Fees is a **district-level** category, alongside municipal taxes. A credit-card issuer is national. A parent finds a school by place, then by name. The same category covers colleges, universities, and coaching institutes.

The category was opened when RBI, on 16 September 2019, expanded BBPS beyond the original utilities to recurring billers generally. Participation is voluntary.

### What the school does once

| Step | What happens |
| --- | --- |
| Pick a sponsor | A biller operating unit (BOU), usually a bank, or an aggregator that already sits on one. |
| Consent and KYC | Signed biller consent, bank account, and the due diligence a payment aggregator applies to a merchant. |
| Name the identifier | The school defines the **student unique number**, and a pattern so junk values are rejected. |
| Expose the demand | A live link from the fee ledger, or a file. Bharat Connect accepts either. |
| Go on the directory | NBBL issues a biller id. Customer apps must show that school within 14 days, because Education Fees already exists as a category. |

The biller unit has 7 days to file the consent after it receives it, and 60 calendar days to finish activation. Bharat Connect says education onboarding itself has no fee. Per-payment interchange and any convenience fee are agreed with the biller unit. There is no single published education tariff.

### What a parent does each term

This is the journey Bharat Connect publishes for Education Fees:

1. Open **Education Fees** in any participating app.
2. Select the school.
3. Enter the student unique number, and any remarks, to fetch the pending fee.
4. Check the student details and the amount.
5. Pay by UPI, card, netbanking, or cash at an agent. If the instrument is UPI, the PIN is the last step.
6. Keep the instant confirmation and the Bharat Connect reference.

### Receipt now, bank credit later

The parent’s app confirms as soon as the biller unit accepts the payment. The rupees reach the school’s account after NBBL nets the cycle and the biller unit pays the school. That netting runs several times on each working day. The reference on the receipt is what the bursar matches to the student, not the parent’s UPI narration.

The network does not decide the fee. If the ledger is wrong, every app shows the wrong figure. Partial payment is a setting on that biller (exact, exact-or-higher, or exact-or-lower), not a rule of the education category. A school’s own counter and website can keep collecting outside Bharat Connect. Cash-paying parents can use an agent on the network instead of the school office.

### How thin the education rail is

Last complete month on [bharat-connect.com/categories](https://www.bharat-connect.com/categories/), read 18 November 2026:

| | Education Fees | For scale |
| --- | --- | --- |
| Billers | 20,759 | Largest biller count of any category |
| Payments | 0.43 million | Electricity: 93.5 million |
| Value | ₹176 crore | Credit cards: about ₹1,00,939 crore |

Spread evenly, that is about **21 payments** per listed education biller in the month, and an average ticket of about **₹4,100**. Real schools sit well above and well below that. The directory is large. The payment habit is not.

---

## One payment, six hops

Domestic and cross-border bill payments use the same chain. An agent institution may serve a customer outside India who is paying a bill inside India. A school fee is this chain with a student number as the identifier.

1. **Name the bill.** The customer gives an identifier on a bank app, a payment app, or at a cash agent.
2. **Ask the biller.** The customer-side unit sends a fetch or a validation to NBBL. NBBL routes it to the unit that onboarded that biller.
3. **Show a real obligation.** The biller returns amount, due date, and bill number. That response is signed. The customer sees the bill before money moves.
4. **Collect locally.** UPI, cash, card, netbanking, IMPS, NEFT, wallet, or AePS pays the customer-side unit. That instrument is outside BBPS. BBPS starts once the unit has the funds.
5. **Post the payment.** The same reference that bound the fetch is sent with the signed bill, unchanged. The biller unit posts it. The customer gets a confirmation and a transaction reference.
6. **Net and guarantee.** Through the working day NBBL nets what each operating unit owes. Funds move by RTGS. If a unit cannot pay, the settlement guarantee fund completes the cycle.

### Four ways a biller accepts a payment

The biller’s master record says which of these is allowed. Every customer channel must refresh that record from NBBL. Hiding billers is a breach. The education journey Bharat Connect publishes is **fetch and pay**.

| Flow | What the customer does | Typical use |
| --- | --- | --- |
| Fetch and pay | Pull the live bill, then pay it | School fees, electricity |
| Validate and pay | Check the identifier is real, then pay | Broadband and similar accounts |
| Validate, pick a plan, pay | Check the identifier, choose a plan | Mobile recharge |
| Direct pay | Pay with no fetch and no validation | Donation |

Online billers answer live. Offline A can still be fetched from data the biller unit holds. Offline B cannot be fetched: validation or direct pay only. When fetch is mandatory, payment is refused unless the fetch came back with response code `000`, and the signed fetch block must be embedded in the payment without being altered.

---

## Who holds which job

| Party | What they actually do |
| --- | --- |
| **BBPCU — NBBL** | Sets the rules, routes every message, nets settlement, runs complaints, and keeps the biller directory. |
| **Customer OU (COU)** | The payer’s front door: a bank or a licensed payment aggregator, itself or through agent institutions and cash agents. |
| **Biller OU (BOU)** | Onboards the biller, does the due diligence, and posts the payment into the biller’s system. A large biller must have a second BOU for continuity. |
| **Agent institution** | A certified front end, onboarded by a COU. Some integrate directly with NBBL, but their funds still settle through a COU. They cannot appoint other institutions. |
| **Agent** | Last-mile counter. Cash and AePS, plus other modes. Cannot appoint sub-agents or hand the connection to a fintech. |
| **Biller aggregator** | Connects many billers to one BOU. The BOU stays accountable. |
| **Sponsor bank** | Holds the escrow and settles for a non-bank operating unit. The agreement is three-way: unit, NBBL, bank. |
| **Technology provider** | Certified integration software only. No funds may pass through a TSP. |

Banks, and non-banks already authorised as payment aggregators, do not need a separate RBI licence to become an operating unit. They tell the Department of Payment and Settlement Systems before they start. A biller’s own counters and website can stay outside BBPS. Anyone else offering bill payment needs authorisation under the Payment and Settlement Systems Act, 2007.

---

## Two references

| Id | Job |
| --- | --- |
| `refId` | Created for the fetch or the validation, and repeated on the payment. It checks that the payment matches the bill just fetched. The customer does not keep it. It is in the API URL as `urn:referenceId`. |
| `txnReferenceId` | Created only when payment starts. This is the receipt. The procedural guidelines call it the Bill Reference Number and require it from initiation through complaints. The first four characters identify the unit that originated the payment. For a school, this is the id the bursar matches to the student. |

Messages are signed XML over TLS 1.2, on NPCI connectivity, between authorised units. Amounts are in paise (₹100 is sent as `10000`). Currency is the ISO code `356`. Each unit sends a heartbeat every three minutes, and every leg expects a synchronous acknowledgement. Core calls include `BillFetchRequest`, `BillValidationRequest`, and `BillPaymentRequest`.

---

## Settlement

The customer’s confirmation is immediate. The biller’s cash is not. Several times on each working day, NBBL computes what each operating unit owes or is owed. The unit pays or receives from its RTGS account, or from its sponsor bank if it is not a bank. NBBL then sends the transaction file so the biller unit can credit each biller. For a school, that credit is the moment the fee becomes money in its account.

Each cycle produces a raw XML of the transactions, a daily settlement report (CSV and PDF), a GST report, and an agent-institution aggregate.

Older technical standards still describe an on-us case: when the collecting unit and the biller’s unit are the same entity, that unit settles internally. The November 2025 procedural guidelines describe NBBL netting between units for transactions routed through it.

If a unit cannot pay, the Settlement Guarantee Fund finishes the cycle. NBBL recovers from the defaulter with penal interest. Ten percent of the required fund comes from participant banks, in proportion to throughput over the prior three months. NBBL arranges the other ninety percent as lines of credit. Of the banks’ share, net issuing banks put up two thirds and net acquiring banks one third.

Each unit also keeps a net debit cap high enough to cover holidays, when transactions continue and funds do not move. A unit that breaches the cap is declined.

### Where the volume sits

Top categories by payment count in that same month: electricity 93.5 million, credit cards 60.38 million, FASTag 35.57 million, loan repayment 33.38 million. By value, credit cards are about ₹1,00,939 crore, then loan repayment about ₹21,647 crore, then electricity about ₹20,237 crore. Education is in neither top eight.

### Bills that arrive before the parent asks

Unified Presentment Management System (UPMS) is the recurring layer. A parent can register the student once, for view-and-pay or for auto-pay. NBBL then either fetches the next demand on the school’s cycle, or accepts a bill the school pushes. The new bill is presented on every channel where that parent is registered. When one channel collects it, the others get a skip notice. Bharat Connect’s education page describes the fee-due notification on the payment apps as part of this.

---

## Next to Senda

For a school, Bharat Connect is a shared directory, a fetched demand, and a guaranteed credit. The school keeps the ledger. The parent’s own app is the counter. NBBL, not the school, stands behind the settlement.

Senda 4.0 separates instruction and proof from the movement of money. A school on Bharat Connect does not get that split. The parent can pay with UPI or cash, but the credit the bursar trusts is NBBL’s net settlement, not a message from the app that merely says someone paid.

The education numbers are the caution. Listing twenty thousand institutions does not move fees onto the rail. Volume sits where the bill is already unavoidable and the amount is fetched: electricity, credit cards, loans, FASTag.

---

## Sources

- NBBL, Procedural Guidelines for BBPS, version 6, November 2025.
- BBPS Technical Standards and BBPS API Specifications, published on bharat-connect.com.
- Bharat Connect biller onboarding page: 7-day consent filing, 60-day activation, 14-day channel refresh for an existing category.
- Biller consent form: Education Fees is a district-level coverage group.
- Education journey and onboarding: [bharat-connect.com/education](https://www.bharat-connect.com/education/).
- Category counts and amounts: [bharat-connect.com/categories](https://www.bharat-connect.com/categories/), last complete month, read 18 November 2026.
- RBI, expansion of biller categories, 16 September 2019.
- UPMS: [bharat-connect.com/solutions/upms](https://www.bharat-connect.com/solutions/upms/).
