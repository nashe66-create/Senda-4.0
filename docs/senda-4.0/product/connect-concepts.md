# Senda Connect + Biller — conceptual / pseudocode model

**Status:** Working concept draft aligned to locked prefs + M1 scaffold (`apps/web`, PR #8 / `cursor/scaffold-mvp-app-3a57`).  
**Audience:** Product + engineering (nashe).  
**Doctrine:** Partners move money (`mto_settles`); Senda owns Links, refs, validation, recon, and proof.  
**Corridor:** UK → ZW private school fees (live). Other corridors are enums-only.

This doc is **conceptual + pseudocode**, not a frozen OpenAPI contract. Field names match the M1 scaffold where that code already exists.

---

## 1. Domain chain (one sentence each)

| Object | Meaning |
| --- | --- |
| **Institution** | School on Biller; KYB + `liveConnect` gate Connect. |
| **SettleDestination** | School’s real bank USD / school-owned EcoCash (not a Senda wallet). |
| **Beneficiary** | Student at that school (`student_ref`). |
| **Link** | Open binding student↔school; public `link_code`. |
| **Obligation** | Amount locked for a term/due; fees-due ledger row. |
| **Attempt** | One partner try to pay an Obligation (idempotent). |
| **Instruction** | Frozen destination + unique `customer_reference`. |
| **Confirmation** | Partner (or stub) attestation of settle. |
| **Proof** | Durable artifact of instruct + confirm + recon. |

```
Institution → SettleDestination
           → Beneficiary → Link → Obligation
                                    ↓
                         Attempt → Instruction → Confirmation → Proof
```

---

## 2. Mukuru UX lookup → `link_code` + Obligation

### Purpose

Let the payer (in Mukuru UI) pick a school + student and lock the amount to pay **without** inventing dues. Lookup resolves into Connect inputs: `link_code` + open `obligation_id` (amount locked on the Obligation).

### Plain English

Mukuru owns search UX. Senda already holds the allowlisted school, students, Links, and Obligations. Lookup is “find what Senda already knows,” not a live ERP pull in M1.

### Inputs (partner / UX)

```
lookup_query:
  school_hint: string | school_id     # name search or known id
  student_hint: string                 # name and/or student_ref
  # optional: term / due_label filter
```

### Checks / rules

```
PSEUDO lookup:
  schools = institutions WHERE country=ZW AND kybStatus=verified AND liveConnect=true
  match school by hint
  students = beneficiaries WHERE institution=school AND active
  match student by name / student_ref
  link = Link WHERE institution+beneficiary AND active AND binding=open_student_school
  obligations = Obligation WHERE same institution+beneficiary
                AND status IN (open, instructed)  # instructed = already mid-flight
                AND stale=false
  IF no link → cannot pay
  IF no open obligation → cannot instruct (dues missing)
  RETURN link_code, obligation summaries (amount locked on each row)
```

### Outputs

```
{
  institution: { id, name, country },
  beneficiary: { id, name, student_ref },
  link_code: "HDA-ADA-001",
  obligations: [
    { id: "obl_001", amount: "850.00", currency: "USD", due_label, status }
  ]
}
```

Amount is **locked on the Obligation**. Validate/instruct may optionally re-check a requested amount against that lock (`amount_mismatch` if different).

### Failure codes (conceptual)

| Code | When |
| --- | --- |
| `institution_not_live` | School not verified / not on live Connect |
| `link_mismatch` / not found | No active Link for school+student |
| `obligation_not_found` | No dues row |
| `obligation_not_open` | Already proven/cancelled/etc. |
| `obligation_stale` | Marked stale; refresh before pay |

### M1 stub vs real

| Piece | M1 |
| --- | --- |
| Dedicated `/lookup` API | **Stubbed / absent** — dogfood + seed use known codes (`HDA-ADA-001` → `obl_001`) |
| Directory search UX | Partner-side (Mukuru); Senda holds data |
| Obligation amount lock | **Real** in validate/instruct |

---

## 3. Link formation (open binding)

### Purpose

Bind **student ↔ school** so Connect can authorize pays against that beneficiary’s Obligations. Day-one Links are **open** (not payer-bound).

### What data binds

```
Link {
  link_code          # public handle partners use
  institution_id
  beneficiary_id
  binding = open_student_school   # Decision #2
  active
}
```

- **Does bind:** school + student.  
- **Does not bind (MVP):** payer identity, remittance account, or a specific MTO.  
- Enum exists for `payer_bound` but is **not** used in the live path.

### Formation (Biller / ops)

```
PSEUDO form_link(school, student_csv_row):
  upsert Beneficiary(student_ref, name, grade)
  IF no active Link for (school, student):
    create Link(link_code=generate(), binding=open_student_school)
  # Fee template → bulk Obligations separately
```

### M1

Links are **seeded** (`HDA-ADA-001`, `HDA-BEN-002`). No self-serve “create Link” UI beyond fixture/seed. Biller shows existing Links’ payment state; creation is ops/CSV conceptually.

---

## 4. KYB / destination verify

### Purpose

Gate who can receive Connect settles: school identity (KYB) + a **verified** settle destination that is Connect-eligible.

### Flags today (M1)

```
Institution.kybStatus: pending | verified | rejected
Institution.liveConnect: boolean

SettleDestination.verified: boolean
SettleDestination.type: bank_usd | ecocash | cash_pickup | paynow | zipit
SettleDestination.ownership:  # EcoCash only
  school_merchant | school_institutional | relative_personal | staff_personal
```

Connect eligibility (lock #10):

```
PSEUDO isConnectEligible(dest):
  IF type NOT IN (bank_usd, ecocash) → REJECT  # paynow/zipit/cash out of Connect
  IF type=ecocash AND ownership NOT IN (school_merchant, school_institutional)
    → REJECT  # relative/staff personal wallets out
  IF NOT dest.verified → destination_unverified
  OK
```

### What ops must prove later (not automated in M1)

| Check | Intent |
| --- | --- |
| Legal entity / registration | School is the real institution |
| Account title match | Bank title ≈ school legal name |
| Bank USD / FCA ownership | School-owned nostro, not a personal account |
| EcoCash merchant/institutional | Till/wallet owned by school, not a relative |
| Re-verify on destination change | Versioned destinations; freeze at instruct |

### Failure codes

`institution_not_live`, `destination_rejected`, `destination_unverified`

### M1 stub vs real

| Piece | M1 |
| --- | --- |
| KYB workflow / document upload | **Stub** — seed sets `kybStatus=verified`, `liveConnect=true` |
| Destination verification ops | **Stub** — boolean `verified=true` on seed rows |
| Eligibility rules in Connect | **Real** (`isConnectEligibleDestination`) |
| Rejected destinations in seed | Present for negative tests (cash, relative EcoCash, paynow, zipit) |

---

## 5. Connect **validate**

### Purpose

Pre-flight: “Can this partner pay this Link’s Obligation to an eligible destination?” No Attempt created.

### Auth

`Authorization: Bearer <partner_api_key>` → Partner record.

### Inputs

```
POST /api/v1/connect/validate
{
  link_code,
  obligation_id,          # external id or internal id
  amount?,                # optional; if present must match Obligation
  destination_type?,      # default bank_usd; only bank_usd | ecocash succeed
  payer_hint?             # accepted at edge; not required for validate logic
}
```

### Checks / rules (pseudocode)

```
PSEUDO validate(partner, input):
  link = find Link by link_code WHERE active
  IF missing → link_mismatch (404)

  IF institution.country ≠ ZW → corridor_not_supported
  IF NOT liveConnect OR kybStatus ≠ verified → institution_not_live

  obligation = find by id/externalId
  IF missing → obligation_not_found
  IF obligation.institution ≠ link.institution → link_mismatch
  IF obligation.beneficiary ≠ link.beneficiary → link_mismatch
  IF status NOT IN (open, instructed) → obligation_not_open
  IF stale → obligation_stale
  IF amount provided AND ≠ obligation.amount → amount_mismatch

  dest = first eligible SettleDestination of preferred type for institution
  IF none / ineligible → destination_rejected | destination_unverified

  IF partner.corridors lacks institution.country
     OR partner.destinationCapabilities lacks dest.type
     → partner_capability_mismatch

  RETURN summaries + freezeDestination(dest)   # no DB write
```

### Outputs

```
{
  ok: true,
  institution, beneficiary, link, obligation, destination  # destination frozen shape
}
```

### Failure codes

`institution_not_live` · `obligation_not_found` · `obligation_not_open` · `obligation_stale` · `link_mismatch` · `destination_rejected` · `destination_unverified` · `partner_capability_mismatch` · `corridor_not_supported` · `amount_mismatch` · `validation_error`

### M1

**Real** in `src/lib/connect.ts` + `/api/v1/connect/validate`.

---

## 6. Connect **instruct**

### Purpose

Create an Attempt + Instruction: freeze the destination snapshot, mint unique `customer_reference`, mark Obligation `instructed`. Partner then settles off-platform with that ref.

### Inputs

```
POST /api/v1/connect/instruct
{
  link_code,
  obligation_id,
  amount,                 # required; must match Obligation
  idempotency_key,        # required
  destination_type?,      # bank_usd | ecocash
  payer_hint?
}
```

### Checks / rules

```
PSEUDO instruct(partner, input):
  existing = Attempt by idempotency_key
  IF existing:
    IF different link/obligation → idempotency_conflict (409)
    IF has Instruction → REPLAY same response (idempotent_replay=true)

  validate(...)           # all validate rules, amount required match

  IN TRANSACTION:
    create Attempt(status=instructed, partner, link, obligation, dest type, payer_hint)
    customer_reference = generate "SND-<ts>-<shortAttemptId>"
    create Instruction(customer_reference, frozenDestination, amount, currency)
    update Obligation.status = instructed

  RETURN attempt_id, customer_reference, destination, amount, currency
```

### Outputs

```
{
  attempt_id,
  customer_reference,     # e.g. SND-M1ABC-ABCD1234
  destination,            # frozen snapshot
  amount, currency,
  status: "instructed",
  idempotent_replay: bool
}
```

### Failure codes

All validate codes + `idempotency_conflict`

### M1

**Real** (including idempotent replay). Senda does **not** move money; partner settles to frozen destination with the ref (`mto_settles`).

---

## 7. Connect **confirm**

### Purpose

Ingest **MTO attestation** that settle happened; recon amount + currency (+ ref match) → `proven` | `needs_reconcile`; write Proof.

### Inputs

```
POST /api/v1/connect/confirm
{
  attempt_id,
  customer_reference,
  amount,
  currency,
  partner_payment_id?,
  settled_at?
}
# source = partner_api on this route
# dogfood sets source = dogfood_stub
```

### MTO attestation fields (day-one trust = L1)

| Field | Role |
| --- | --- |
| `customer_reference` | Must match Instruction |
| `amount` / `currency` | Compared to instructed |
| `partner_payment_id` | Partner’s own settle id (optional) |
| `settled_at` | Partner-asserted settle time |
| `source` | `partner_api` \| `dogfood_stub` \| `manual_ops` |

### Checks / rules

```
PSEUDO confirm(partner, input):
  attempt = load with instruction, confirmation, proof, obligation
  IF missing instruction → attempt_not_found
  IF wrong partner (and source ≠ dogfood_stub) → attempt_not_found
  IF confirmation+proof exist → REPLAY
  IF confirmation without proof → already_confirmed (409)
  IF customer_reference ≠ instruction → reference_mismatch

  recon =
    IF amount+currency match instruction → proven
    ELSE → needs_reconcile (+ notes)

  create Confirmation(source, recon…)
  update Attempt + Obligation status to proven | needs_reconcile
  write Proof artifact (senda.proof.v1)
  RETURN status, recon_result, proof_id, storage_key
```

**Explicit:** day-one recon does **not** check bank statement, EcoCash till feed, or bursar mark-received. That is attestation, not school-received ledger evidence.

### Failure codes

`attempt_not_found` · `already_confirmed` · `reference_mismatch` (+ auth errors)

### M1

**Real** recon on ref/amount/currency. Confirmation `source` distinguishes partner vs dogfood stub vs manual ops.

---

## 8. Proof artifact shape

### Purpose

Durable record for partner + school that an Attempt was instructed and confirmed, with recon outcome.

### Shape (`senda.proof.v1`)

```
{
  schema: "senda.proof.v1",
  attempt_id,
  customer_reference,
  institution: { id, name, country },
  beneficiary: { id, name, student_ref },
  obligation: { id, amount, currency },
  instruction: {
    amount, currency,
    frozen_destination: { id, type, currency, verified, account_title, bank_name,
                          account_number, ownership, msisdn }
  },
  confirmation: {
    amount, currency,
    partner_payment_id,
    settled_at,
    source                 # partner_api | dogfood_stub | manual_ops
  },
  recon: { result: proven | needs_reconcile, notes },
  proven_at                # write time (name historical; also set on needs_reconcile)
}
```

### Storage (M1)

Local stub: `PROOF_STORAGE_DIR` → `local://proof_<attemptId>.json`. Production target: S3-compatible object store (lock #9); same payload shape.

### M1

**Real** write path; storage backend is local-file stub.

---

## 9. Partner capability matrix

Partners declare what they can settle. Validate/instruct enforce match.

| Seed partner | Corridors | Destination capabilities | Intent |
| --- | --- | --- | --- |
| `partner_mukuru_sbx` | ZW | `bank_usd`, `ecocash` | Happy-path Mukuru sandbox |
| `partner_bank_only` | ZW | `bank_usd` only | Negative: EcoCash → `partner_capability_mismatch` |
| `partner_no_zw` | _(none)_ | _(none)_ | Negative: corridor fail |

```
PSEUDO partnerCanSettle(partner, destType, institutionCountry):
  IF country NOT IN partner.corridors → fail
  IF destType NOT IN partner.destinationCapabilities → fail
  OK
```

Auth: API key hashed at rest; Bearer presented on Connect routes.

---

## 10. What Mukuru must provide vs what Senda already holds

| Concern | Mukuru provides | Senda already holds |
| --- | --- | --- |
| Payer UX / ~90s remit | Yes (Mukuru app) | No consumer app for payer |
| Collect / FX / payout rail | Yes (`mto_settles`) | No PSP-core |
| School / student directory data | Query only | Institution, Beneficiary, Link, Obligation |
| Amount due | Displays locked amount | Obligation amount + currency |
| Validate / instruct / confirm API calls | Calls Connect | Implements rules + ledger |
| Settle to frozen destination + ref | Executes transfer | Issues Instruction |
| Attestation of settle | `confirm` payload | Recon + Proof |
| School KYB / destination | — | Biller / ops flags |
| Proof visibility to school | Optional partner copy | Biller + proof store |

Lookup UX is Mukuru’s; **truth** of who/what can be paid is Senda’s.

---

## 11. Dogfood stub ≠ bank-received evidence; BankEvidence is future

### Dogfood

Thin UI runs validate → instruct → confirm with `source: dogfood_stub`. Same recon math as partner confirm. **It is not evidence the school’s bank or EcoCash received funds.** It only proves the software loop.

```
ConfirmationSource:
  partner_api    # real MTO attest (still L1 — not bank feed)
  dogfood_stub   # founder/ops loop; NOT bank-received
  manual_ops     # ops-entered attest
```

### Trust ladder (from school-received research)

| Level | Meaning | M1 |
| --- | --- | --- |
| **L1 Attest** | Partner/stub asserts settle | **Implemented** |
| **L2 Evidence** | Statement screenshot / SMS artifact | Future |
| **L3 Ledger feed** | Bank/EcoCash system-of-record credit | Future (`BankEvidence` / till feeds) |
| **L4 Network confirm** | Rail-level credited (e.g. gpi) | Future |

### Explicit product rule

- `proven` today = **ref + amount + currency match on an attestation** (`partner_api` / `dogfood_stub` / `manual_ops`).  
- **`dogfood_stub` ≠ bank-received evidence.**  
- **`BankEvidence` (or EcoCash till feed) is future** — not in M1 schema or Connect confirm. Disputes / unpaid school → `needs_reconcile` / ops; do not pretend L3 in the dogfood UI.

---

## 12. Biller surface (conceptual)

| Function | Purpose | M1 |
| --- | --- | --- |
| School login | Auth bursar/ops to institution | Stub password (`passwordStub`) |
| View Obligations / Attempts / Proofs | Payment visibility beside school ERP | Read UI for seeded school |
| KYB / destination / Link / CSV | Onboarding + freshness | Seeded data; full workflows later |
| Mark external local payment | Keep dues honest when paid off-Connect | Conceptual; not deep in M1 |

Biller sits **beside** school finance tools — it is not the school’s full ERP.

---

## 13. End-to-end abroad happy path (pseudocode)

```
# Setup (Biller / ops) — once per school/term
KYB → verified; liveConnect=true
verify SettleDestination(bank_usd or school ecocash)
CSV students → Beneficiaries + open Links
fee template → Obligations (amount locked)

# Pay time (Mukuru UX + Connect)
payer picks school+student
lookup → link_code + open obligation          # amount locked
validate(link_code, obligation_id, amount?)
instruct(... idempotency_key) → customer_reference + frozen destination
Mukuru settles to destination with customer_reference
confirm(attempt_id, customer_reference, amount, currency, partner_payment_id)
  → proven | needs_reconcile
Proof artifact available to partner + school
```

---

## 14. Implementation map (M1)

| Concept | Code (PR #8 scaffold) |
| --- | --- |
| Validate / instruct / confirm | `apps/web/src/lib/connect.ts` |
| API routes | `apps/web/src/app/api/v1/connect/{validate,instruct,confirm}` |
| Dogfood loop | `apps/web/src/app/api/v1/dogfood/run` + `/dogfood` |
| Proof write | `apps/web/src/lib/proofs.ts` |
| Schema / enums | `apps/web/prisma/schema.prisma` |
| Pilot fixture | `apps/web/prisma/seed.ts` (Heritage Demo Academy) |

---

## Related

- [How it works](./how-it-works.md)
- [School-received confirmation](../research/school-received-confirmation.md) — trust ladder; BankEvidence future
- Locked prefs: Decisions #1–#2, #5, #9–#10; Mukuru-class UX; fetch-at-pay Obligations
