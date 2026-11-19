# Connect partner sandbox — validate → instruct → confirm → proof

**Audience:** Remittance / purpose-pay partners integrating Connect.  
**Language:** Generic **partner** + **biller** (organisation). School fees are the first live wedge, not the product limit.  
**Base URL (local):** `http://localhost:3000/api/v1/connect`  
**Auth:** Partner API key on every Connect call.

Related: [Connect concepts](./connect-concepts.md) (glossary + rules) · [How it works](./how-it-works.md) · app README (`apps/web/README.md`)

---

## 1. Auth

Send your sandbox API key on every request:

```http
Authorization: Bearer sk_sandbox_partner_demo
```

Also accepted: `X-Api-Key: sk_sandbox_partner_demo`.

| Outcome | HTTP | `error.code` | Meaning |
| --- | --- | --- | --- |
| Missing key | 401 | `unauthorized` | Add the Bearer header |
| Wrong / inactive key | 401 | `unauthorized` | Check the seeded sandbox key |

**Demo key (after `npm run db:seed`):** `sk_sandbox_partner_demo`  
Override with env `SANDBOX_API_KEY` before seeding. The test-loop UI (`/dogfood`) uses the same demo partner fixture and does not need you to paste the key.

---

## 2. Error envelope

All Connect errors use the same JSON shape:

```json
{
  "error": {
    "code": "unauthorized",
    "message": "Partner API key required. Send Authorization: Bearer <key> (or X-Api-Key)."
  }
}
```

`message` is plain language for partner engineers / support. Prefer that over reading the code alone.

Common codes: `unauthorized`, `validation_error`, `destination_rejected`, `partner_capability_mismatch`, `retry_key_conflict`, `confirm_conflict`, `attempt_not_found`, `needs_reconcile` (as a **success** `recon_result`, not an error).

---

## 3. Retry key (instruct)

When creating pay instructions, send a **retry key** so a network retry does not open a second payment.

| Partner field | Also accepted | System column |
| --- | --- | --- |
| `retry_key` (preferred) | `idempotency_key`, header `Idempotency-Key` / `X-Retry-Key` | `attempts.idempotency_key` |

**Rules**

1. Same retry key + same pay code + same amount due + same amount → same pay instructions again (`replayed: true`). **Safe to retry.**
2. Same retry key with a **different** pay code, amount due, or amount → `409` `retry_key_conflict`. Use a **new** retry key for a new payment.
3. Generate the key in your system (e.g. your collect / order id). Do not reuse a key across different pays.

Say to your team: *“Safe to retry with the same retry key.”* Avoid leading with “idempotent.”

---

## 4. Flow

```
validate  →  can we pay this?
instruct  →  pay instructions + payment reference  (settle off Senda)
confirm   →  partner says they paid  →  confirmed | needs a check
proof     →  senda.proof.v1 only when confirmed
```

### 4.1 Validate — “can we pay this?”

`POST /api/v1/connect/validate`

```bash
curl -s -X POST localhost:3000/api/v1/connect/validate \
  -H "Authorization: Bearer sk_sandbox_partner_demo" \
  -H "content-type: application/json" \
  -d '{
    "link_code": "HDA-ADA-001",
    "obligation_id": "obl_001",
    "amount": "850.00",
    "destination_type": "bank_usd"
  }'
```

Checks: organisation live, pay code matches person + amount due, amount matches (if sent), payout account allowed (`bank_usd` or school-owned `ecocash`), partner can settle that corridor/type.

### 4.2 Instruct — “here’s where to send it”

`POST /api/v1/connect/instruct`

```bash
curl -s -X POST localhost:3000/api/v1/connect/instruct \
  -H "Authorization: Bearer sk_sandbox_partner_demo" \
  -H "content-type: application/json" \
  -d '{
    "link_code": "HDA-ADA-001",
    "obligation_id": "obl_001",
    "amount": "850.00",
    "retry_key": "partner-order-1001",
    "destination_type": "bank_usd"
  }'
```

Example success:

```json
{
  "attempt_id": "…",
  "customer_reference": "SND-…",
  "destination": { "type": "bank_usd", "…": "…" },
  "amount": "850.00",
  "currency": "USD",
  "status": "instructed",
  "replayed": false
}
```

Settle **off Senda** to the frozen payout account using `customer_reference` as the payment reference.

### 4.3 Confirm — partner → Senda callback

After you settle, call confirm. This is **partner attestation** (“we paid”), not a bank feed proving the biller received funds.

`POST /api/v1/connect/confirm`

**Request (stable)**

```json
{
  "attempt_id": "<from instruct>",
  "customer_reference": "<payment reference from instruct>",
  "amount": "850.00",
  "currency": "USD",
  "partner_payment_id": "PARTNER-TXN-1",
  "settled_at": "2026-11-19T12:00:00.000Z"
}
```

| Field | Required | Meaning |
| --- | --- | --- |
| `attempt_id` | yes | Payment id from instruct |
| `customer_reference` | yes | Payment reference from instruct |
| `amount` | yes | Amount you settled |
| `currency` | yes | Currency you settled |
| `partner_payment_id` | no | Your own settle / txn id |
| `settled_at` | no | ISO-8601; defaults to now |

**Response (stable)**

```json
{
  "attempt_id": "…",
  "status": "proven",
  "recon_result": "proven",
  "recon_notes": null,
  "proof_id": "…",
  "storage_key": "…",
  "proof_issued": true,
  "customer_reference": "SND-…",
  "partner_payment_id": "PARTNER-TXN-1",
  "settled_at": "2026-11-19T12:00:00.000Z",
  "instructed": { "amount": "850.00", "currency": "USD" },
  "confirmed": { "amount": "850.00", "currency": "USD" },
  "replayed": false
}
```

**Recon rules (day one)**

| Check | Match | Mismatch |
| --- | --- | --- |
| Payment reference (`customer_reference`) | — | → `needs_reconcile` |
| Amount | — | → `needs_reconcile` |
| Currency | — | → `needs_reconcile` |
| All three match | `proven` (confirmed) + `senda.proof.v1` | — |

Mismatches are recorded on the confirmation (`recon_notes`) and surface as **needs a check** — not a silent reject with no trail. No trusted payment proof is issued until all three match.

Re-posting the **same** confirm payload is safe (`replayed: true`). A different amount/reference after a first confirm → `409` `confirm_conflict`.

```bash
curl -s -X POST localhost:3000/api/v1/connect/confirm \
  -H "Authorization: Bearer sk_sandbox_partner_demo" \
  -H "content-type: application/json" \
  -d '{
    "attempt_id": "<from instruct>",
    "customer_reference": "<from instruct>",
    "amount": "850.00",
    "currency": "USD",
    "partner_payment_id": "PARTNER-1"
  }'
```

### 4.4 Proof

When `recon_result` is `proven`, `proof_issued` is true and `storage_key` points at the `senda.proof.v1` JSON (local files under `apps/web/proofs/` in M1). Billers see the same artifact in Biller later (M5).

---

## 5. Sandbox fixture (generic biller)

Seeded demo organisation (a school for the first wedge — treat as any biller):

| What | Value |
| --- | --- |
| Organisation | Heritage Demo Academy (`inst_heritage_demo`) |
| Pay code | `HDA-ADA-001` |
| Amount due | `obl_001` · **850.00 USD** |
| Payout types | `bank_usd`, school-owned `ecocash` |
| Demo partner key | `sk_sandbox_partner_demo` |

Out-of-date amount due `obl_stale` is rejected on validate. Rejected payout types (`cash_pickup`, relative EcoCash, `paynow`, `zipit`) return `destination_rejected`.

---

## 6. How to exercise

**Option A — curl** (above): validate → instruct → confirm with the demo key.

**Option B — test loop UI:** open `/dogfood`, run happy path or mismatch. Uses the same demo partner in the DB; **test confirmation ≠ money received at the organisation.**

**Option C — mismatch check:** confirm with a wrong amount (or wrong payment reference). Expect `recon_result: "needs_reconcile"`, `proof_issued: false`.

```bash
# From apps/web after migrate + seed + npm run dev
# 1) instruct once, capture attempt_id + customer_reference
# 2) confirm with amount 800.00 → needs a check
```

---

## 7. Out of scope here

- Outbound webhooks (`attempt.proven`, …) — later  
- Biller UI depth (M5)  
- Live pilot ops loop (M6)  
- Bank / wallet credit evidence (future trust ladder)
