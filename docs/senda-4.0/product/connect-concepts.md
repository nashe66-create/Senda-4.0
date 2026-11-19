# Connect + Biller — how the pieces work (plain language + pseudocode)

**Status:** Working draft. Aligned to locked product decisions and the M1 app scaffold.  
**Audience:** Product + engineering.  
**Language ownership:** This file’s §0 wording map is the vocabulary seed for product docs + `apps/web` UI copy (uniform plain-language pass).  
**Core idea:** A **partner** moves the money. Senda checks that the pay is allowed, tells them where to send it and which reference to use, then records whether that pay can be trusted as proven.

**First live wedge (example, not the product limit):** UK → Zimbabwe **school fees**. The same pattern is meant for other billers later (medical, funeral, utilities, …).  
**Partners:** Any remittance / purpose-pay partner on Connect — not one named brand. Named partners in fixtures are demos only.

This is a **concept + pseudocode** note, not a frozen API contract. Where the M1 code already has field names, those appear in backticks as *system* names.

---

## 0. Language we use with people

Two layers of wording:

| Layer | Who sees it | Rule |
| --- | --- | --- |
| **User words** | Payers in a partner app; bursars / ops in Biller; dogfood UI | Everyday English. No jargon unless we immediately explain it. |
| **System words** | API fields, DB, logs, this pseudocode | Stable identifiers. Can stay technical if the UI never shows them raw. |

If a system word would show on a screen, either rename it for display or pair it with a plain label.

### Suggested wording map

| System name (today) | Say this to users | Why |
| --- | --- | --- |
| Institution | **Organisation** or **biller** (or “school” only when it *is* a school) | “Institution” is cold; school is only the first biller type. |
| Beneficiary | **Who it’s for** — e.g. student, patient, member | Role depends on biller type. |
| Link / `link_code` | **Pay code** | Short, copyable, partner-friendly. |
| Obligation | **Amount due** / **bill** / **what’s owed** | “Obligation” is accurate legally but opaque in a pay UI. Prefer “amount due” in copy; keep or rename the system object later. |
| Attempt | **Payment** (or “this pay try”) | Users don’t need “attempt.” |
| Instruction | **Pay instructions** (where to send + reference) | Clear job. |
| `customer_reference` | **Payment reference** | What the partner puts on the transfer. |
| Confirmation | **Partner confirmation** (“they say they paid”) | Honest about trust level. |
| Proof | **Payment proof** / **receipt for the organisation** | Shared artifact. |
| SettleDestination | **Payout account** / **where the money goes** | Bank or school-owned wallet — not a Senda wallet. |
| KYB | **Organisation checks** (verified to go live) | Expand once; then “verified organisation” is enough. |
| `idempotency_key` | **Retry key** — “same request won’t create a second payment” | Never show “idempotent” in UI. |
| `proven` | **Confirmed** | Positive outcome after checks. |
| `needs_reconcile` | **Needs a check** | Ops/partner must look. |
| `dogfood_stub` | **Test confirmation** (not real bank proof) | Must never read as “school received money.” |
| `stale` (on amount due) | **Out of date — refresh before paying** | Actionable. |

### Open product call (nashe)

**Is “Obligation” the right *system* name?**  
Conceptually it means: a locked, allowlisted **amount due** for a specific person at a specific organisation. Strong alternatives for a later rename: `Due`, `Bill`, `AmountDue`. Until renamed, docs and UI should prefer **amount due** / **bill** in human text, and treat `Obligation` as the internal label. **This pass does not rename Prisma / DB tables** — M1 UI uses display aliases only (`apps/web/src/lib/ui-labels.ts` + screen copy).

**“Idempotent”** stays an engineering word only. Product/API docs for partners can say: *safe to retry with the same retry key*.

### M1 UI aliases (shipped)

| Screen | Labels |
| --- | --- |
| Home / nav | Test loop, Biller login |
| Dogfood | Amount due, Pay code, Payout account, test confirmation |
| Biller | Amounts due, Who it’s for, Payments, Payment reference, Payment proofs; status **Confirmed** / **Needs a check** |

---

## 1. The chain (one sentence each)

| Piece | Plain meaning | System name |
| --- | --- | --- |
| Organisation on Senda | Verified biller that can receive Connect pays | Institution |
| Payout account | Their real bank / school-owned wallet | SettleDestination |
| Who it’s for | Person the bill belongs to (student, …) | Beneficiary |
| Pay code | Open bind of person ↔ organisation | Link + `link_code` |
| Amount due | Locked amount for a period / label | Obligation |
| Payment | One partner try to settle that amount due | Attempt |
| Pay instructions | Frozen payout details + payment reference | Instruction |
| Partner confirmation | Partner attests they settled | Confirmation |
| Payment proof | Saved record of instructions + confirmation + outcome | Proof |

```
Organisation → Payout account
            → Who it’s for → Pay code → Amount due
                                          ↓
                    Payment → Pay instructions → Partner confirmation → Payment proof
```

First wedge reads as: school → school bank/EcoCash → student → pay code → school-fee bill → …  
Same shapes should work for other billers without renaming the whole product.

---

## 2. Lookup (partner UX) → pay code + amount due

### Purpose

In the **partner’s** app, the payer finds the right organisation + person and sees **what’s owed**. That resolves to Connect inputs: a **pay code** and an open **amount due** (amount already locked).

### Plain English

The partner owns search and screens. Senda already holds the allowlisted organisations, people, pay codes, and amounts due. Lookup means “find what Senda already knows,” not inventing a bill at pay time (and not a live ERP pull in M1).

### Example (school fees — first wedge only)

Payer picks a school + student → gets pay code `HDA-ADA-001` and amount due `obl_001` at **850.00 USD**.

### Inputs (conceptual)

```
lookup_query:
  organisation_hint: string | id     # name or known id
  person_hint: string                # name and/or their ref at the biller
  # optional: period / due label
```

### Checks / rules

```
PSEUDO lookup:
  orgs = organisations WHERE country is live pilot
                 AND organisation checks = verified
                 AND live on Connect
  match organisation by hint
  people = who-it’s-for WHERE organisation matches AND active
  match person by name / their ref
  pay_code = Link for that organisation + person (active, open binding)
  amounts_due = open (or mid-flight) amounts for that pair, not marked out-of-date
  IF no pay code → cannot pay
  IF no open amount due → cannot issue pay instructions
  RETURN pay_code + amount-due summaries (amount locked on each row)
```

### Outputs (shape)

```
{
  organisation: { id, name, country },
  person: { id, name, their_ref },
  link_code: "…",                 # pay code
  obligations: [                  # amounts due (system name)
    { id, amount, currency, due_label, status }
  ]
}
```

### Failures (user-friendly meaning)

| System code | User / partner meaning |
| --- | --- |
| `institution_not_live` | This organisation isn’t verified / live yet |
| `link_mismatch` | Pay code missing or doesn’t match that person |
| `obligation_not_found` | No amount due on file |
| `obligation_not_open` | That bill isn’t open for a new pay |
| `obligation_stale` | Amount due is out of date — refresh first |

### M1 stub vs real

| Piece | M1 |
| --- | --- |
| Dedicated lookup API | **Not built** — demos use known pay codes from seed data |
| Search UX | Partner app |
| Locked amount on the bill | **Real** in validate / instruct |

---

## 3. Pay code formation (open binding)

### Purpose

Tie **who it’s for ↔ organisation** so Connect can allow pays against that person’s amounts due. Day one: **open** (not locked to one payer).

### What binds

```
Link {
  link_code          # pay code partners use
  organisation
  person
  binding = open     # Decision #2: not payer-bound yet
  active
}
```

- **Binds:** organisation + person.  
- **Does not bind (MVP):** payer identity or a specific partner.  
- A “payer-bound” option exists in the model for later; not used on the live path.

### Formation (Biller / ops)

```
PSEUDO form_pay_code(organisation, roster_row):
  upsert person (their_ref, name, …)
  IF no active pay code for (organisation, person):
    create pay code (open binding)
  # Fee / bill templates → bulk amounts due separately
```

### M1

Pay codes are **seeded** for the demo school. Full self-serve create UI comes later. Biller today is mainly visibility over what already exists.

---

## 4. Organisation checks + payout account verify

### Purpose

Only verified organisations with a **checked payout account** can receive Connect settles. The account is **theirs** (bank / organisation-owned wallet) — not a Senda wallet.

### Flags today (M1)

```
organisation.kybStatus: pending | verified | rejected
organisation.liveConnect: yes/no

payout_account.verified: yes/no
payout_account.type: bank_usd | ecocash | … (others exist but are out of Connect)
```

Connect-allowed payout types (lock #10): **bank USD** and **organisation-owned EcoCash** only. Cash pickup, relative wallets, Paynow, ZIPIT stay out of Connect for the pilot.

```
PSEUDO payout_ok_for_connect(account):
  IF type not bank_usd or organisation-owned ecocash → reject
  IF EcoCash but owned by relative/staff personally → reject
  IF not verified → “payout account not verified”
  OK
```

### What ops must prove later (not automated in M1)

Legal identity of the organisation; account title matches; bank/wallet really owned by the organisation; re-check when the payout account changes.

### M1 stub vs real

| Piece | M1 |
| --- | --- |
| Full KYB / document flow | **Stub** — seed marks the demo org verified + live |
| Payout verification ops | **Stub** — boolean flag |
| Connect eligibility rules | **Real** |

---

## 5. Connect **validate** (“can we pay this?”)

### Purpose

Pre-flight check: can this partner pay this pay code’s amount due to an allowed payout account? **Does not** create a payment yet.

### Auth

Partner API key.

### Inputs

```
POST /api/v1/connect/validate
{
  link_code,              # pay code
  obligation_id,          # amount due id
  amount?,                # if sent, must match locked amount
  destination_type?,      # bank_usd | ecocash (default bank)
  payer_hint?             # optional note from partner
}
```

### Rules (pseudocode)

```
PSEUDO validate(partner, input):
  resolve pay code (must be active)
  organisation must be live pilot country + verified + live on Connect
  amount due must exist, match same organisation + person, be open (or mid-flight), not out of date
  if amount provided → must equal locked amount
  pick eligible payout account of requested type
  partner must support that country and that payout type
  RETURN summaries + frozen payout snapshot   # no write
```

### Output (idea)

Organisation, person, pay code, amount due, payout account — enough for the partner UI to show “you’re about to pay X for Y at Z.”

### Failures

Same codes as lookup, plus: payout rejected / not verified, partner can’t settle that type or corridor, amount mismatch, corridor not supported.

### M1

**Real** in `apps/web/src/lib/connect.ts`.

---

## 6. Connect **instruct** (“here’s where to send it”)

### Purpose

Create the **payment** and **pay instructions**: freeze payout details, mint a unique **payment reference**, mark the amount due as mid-flight. The partner then settles **off Senda** using that reference.

### Inputs

```
POST /api/v1/connect/instruct
{
  link_code,
  obligation_id,
  amount,                 # required; must match
  idempotency_key,        # retry key — same key = same payment, not a duplicate
  destination_type?,
  payer_hint?
}
```

### Rules (pseudocode)

```
PSEUDO instruct(partner, input):
  IF retry key already used:
    IF same pay code + amount due → return the same instructions again
    ELSE → conflict (don’t silently attach to a different bill)
  run validate (amount required)
  create payment (status = instructed)
  payment_reference = generate unique ref
  save pay instructions (frozen payout + ref + amount)
  mark amount due as instructed
  RETURN payment id, payment reference, payout snapshot, amount
```

### Say this to partners

> Send the same **retry key** if your request may have been retried. You will get the same pay instructions back — you will not open a second payment by accident.

Avoid leading with “idempotent.”

### M1

**Real**, including safe retry. Senda does **not** move the money.

---

## 7. Connect **confirm** (“partner says they paid”)

### Purpose

Take the partner’s confirmation, compare payment reference + amount + currency to what we instructed, then mark **confirmed** or **needs a check**, and write **payment proof**.

### Inputs

```
POST /api/v1/connect/confirm
{
  attempt_id,             # payment id
  customer_reference,     # payment reference
  amount,
  currency,
  partner_payment_id?,    # their own settle id
  settled_at?
}
```

Confirmation **source** (system): `partner_api` | `dogfood_stub` (test) | `manual_ops`.

### Day-one trust

This is **partner attestation** (“we paid”), not a bank statement or wallet feed proving the organisation received funds.

### Rules (pseudocode)

```
PSEUDO confirm(partner, input):
  load payment + pay instructions
  payment reference must match
  IF amount + currency match instructions → confirmed (proven)
  ELSE → needs a check
  save partner confirmation + payment proof
```

### M1

**Real** for reference / amount / currency. No bank feed yet.

---

## 8. Payment proof shape

### Purpose

A durable record for the partner and the organisation: what was instructed, what was confirmed, and the outcome.

### Shape (`senda.proof.v1`) — system fields

Includes payment id, payment reference, organisation, person, amount due, frozen payout, confirmation (including **source**), and recon outcome (`proven` / `needs_reconcile`).

### Storage (M1)

Local files for now; later S3-compatible storage. Same payload shape.

---

## 9. Partner capability matrix

Each partner declares which countries and payout types they can settle. Validate / instruct enforce that.

Demo seeds (names are fixtures, not product identity):

| Demo partner | Country | Can settle |
| --- | --- | --- |
| Full demo partner | ZW | bank USD + EcoCash |
| Bank-only demo | ZW | bank USD only → EcoCash fails capability check |
| No-corridor demo | none | fails country check |

---

## 10. What the partner brings vs what Senda holds

| Concern | Partner | Senda |
| --- | --- | --- |
| Payer experience (~90s remit-class) | Their app | No consumer payer app |
| Collect / FX / payout rails | Yes | Not a PSP |
| Who can be paid / what’s owed | Looks up | Holds organisation, person, pay code, amount due |
| Validate / instruct / confirm | Calls Connect | Owns rules + ledger |
| Settle with payment reference | Executes transfer | Issues pay instructions |
| “We paid” confirmation | Sends confirm | Recon + payment proof |
| Organisation checks / payout verify | — | Biller / ops |
| Proof for the organisation | Optional copy | Biller + proof store |

---

## 11. Test confirmation ≠ money received; bank evidence is later

### Dogfood / test loop

The thin dogfood UI runs validate → instruct → confirm with source **test confirmation** (`dogfood_stub`). Same math as a partner confirm. **It does not mean the organisation’s bank or wallet received money.**

### Trust ladder (short)

| Level | Meaning | M1 |
| --- | --- | --- |
| Partner / test says they paid | Attestation | **Yes** |
| Screenshot / statement artifact | Light evidence | Later |
| Bank or wallet feed | System-of-record credit | Later (`BankEvidence` / till feeds) |
| Rail-level “credited” | Network confirm | Later |

**Product rule:** **Confirmed** today means payment reference + amount + currency matched an attestation. **Test confirmation ≠ received at the organisation.** Bank evidence is future — do not imply it in UI copy.

---

## 12. Biller surface (conceptual)

Biller is for the **organisation** (first wedge: a school). It sits **beside** their existing finance tools — it does not replace their full ledger.

| Job | Plain meaning | M1 |
| --- | --- | --- |
| Sign in | Staff access for their organisation | Stub password |
| See amounts due / payments / proofs | Visibility | Demo org read UI |
| Organisation checks, payout accounts, pay codes, roster | Onboarding + freshness | Mostly seeded |
| Record an off-Connect local pay | Keep “what’s owed” honest | Concept for later depth |

---

## 13. Happy path (pseudocode, generic)

```
# Setup (Biller / ops) — once per organisation / billing period
organisation checks → verified; live on Connect
verify payout account (allowed type)
import people → pay codes (open)
bill / fee templates → amounts due (amount locked)

# Pay time (partner app + Connect)
payer finds organisation + person
lookup → pay code + open amount due
validate(pay code, amount due, amount?)
instruct(... retry key) → payment reference + frozen payout
partner settles to that payout with the payment reference
confirm(payment id, payment reference, amount, currency, …)
  → confirmed | needs a check
payment proof available to partner + organisation
```

**School-fees reading of the same path:** school + student + term bill; partner remits to the school’s account with Senda’s payment reference.

---

## 14. Where this lives in M1 code

| Concept | Code (PR #8 scaffold) |
| --- | --- |
| Validate / instruct / confirm | `apps/web/src/lib/connect.ts` |
| API routes | `apps/web/src/app/api/v1/connect/{validate,instruct,confirm}` |
| Test loop | `apps/web/src/app/api/v1/dogfood/run` + `/dogfood` |
| Proof write | `apps/web/src/lib/proofs.ts` |
| Schema | `apps/web/prisma/schema.prisma` |
| Demo seed | `apps/web/prisma/seed.ts` |

---

## Related

- [How it works](./how-it-works.md)
- [School-received confirmation](../research/school-received-confirmation.md) — trust ladder; bank evidence later
- Locked decisions: dogfood UI; open links; ZW-first pilot; stack; Connect settle types
