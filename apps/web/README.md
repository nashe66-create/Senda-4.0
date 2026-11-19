# Senda 4.0 — web app (`apps/web`)

Next.js App Router + TypeScript + Prisma + Postgres.

**Product loop (system names):** Institution → SettleDestination → Beneficiary → Link → Obligation → Attempt → Instruction → Confirmation → Proof.

**Say to users:** organisation → payout account → who it’s for → pay code → amount due → payment → pay instructions → partner confirmation → payment proof.

**Surfaces:** Connect (partner API key), Biller (organisation stub login), Test loop / dogfood (no live remittance partner).

**Wording map:** [`../../docs/senda-4.0/product/connect-concepts.md`](../../docs/senda-4.0/product/connect-concepts.md) §0  
**How it works:** [`../../docs/senda-4.0/product/how-it-works.md`](../../docs/senda-4.0/product/how-it-works.md)

## Prerequisites

- Node 20+
- Postgres 16 (Docker Compose from repo root, or local Postgres)

## Run locally

From **repo root**:

```bash
docker compose up -d postgres
```

From **`apps/web`**:

```bash
cp .env.example .env   # if needed
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open http://localhost:3000

| Surface | URL | Creds |
| --- | --- | --- |
| Home | `/` | — |
| Test loop | `/dogfood` | validate → pay instructions → test confirmation → proof |
| Biller | `/biller` | Login at `/login` |
| Biller login | `/login` | `bursar@heritage-demo.zw` / `pilot` |

### Connect API (sandbox)

Base: `http://localhost:3000/api/v1/connect`

Header: `Authorization: Bearer sk_sandbox_mukuru_demo`  
*(fixture key id — demo remittance partner; not a product brand)*

```bash
# Validate (“can we pay this?”)
curl -s -X POST localhost:3000/api/v1/connect/validate \
  -H "Authorization: Bearer sk_sandbox_mukuru_demo" \
  -H "content-type: application/json" \
  -d '{"link_code":"HDA-ADA-001","obligation_id":"obl_001","amount":"850.00","destination_type":"bank_usd"}'

# Instruct — retry key (idempotency_key): same key is safe to retry
curl -s -X POST localhost:3000/api/v1/connect/instruct \
  -H "Authorization: Bearer sk_sandbox_mukuru_demo" \
  -H "content-type: application/json" \
  -d '{"link_code":"HDA-ADA-001","obligation_id":"obl_001","amount":"850.00","idempotency_key":"demo-1","destination_type":"bank_usd"}'

# Confirm (partner attestation — safe to retry with same payload)
curl -s -X POST localhost:3000/api/v1/connect/confirm \
  -H "Authorization: Bearer sk_sandbox_mukuru_demo" \
  -H "content-type: application/json" \
  -d '{"attempt_id":"<from instruct>","customer_reference":"<from instruct>","amount":"850.00","currency":"USD","partner_payment_id":"PARTNER-1"}'
```

Rejected destination types (`cash_pickup`, relative EcoCash, `paynow`, `zipit`) return `destination_rejected`. Partner capability / corridor mismatches return `partner_capability_mismatch` or `corridor_not_supported`.

### Fixture (from `docs/senda-4.0/testing/fixtures/pilot-zw.yaml`)

- Organisation (demo school): Heritage Demo Academy (`inst_heritage_demo`)
- Payout accounts: `bank_usd` + organisation `ecocash`
- Who it’s for / pay codes: Ada `HDA-ADA-001`, Ben `HDA-BEN-002`
- Amounts due: `obl_001`, `obl_002` (open); `obl_stale` (rejected on validate)

### Proofs

JSON written under `apps/web/proofs/` (local stub of S3-compatible object storage). Swap `src/lib/proofs.ts` for real S3/R2 later.

## UI glossary (display only)

| Screen label | System / API |
| --- | --- |
| Amount due / bill | `Obligation` |
| Pay code | `Link.link_code` |
| Payment reference | `customer_reference` |
| Confirmed | `proven` |
| Needs a check | `needs_reconcile` |
| Test confirmation | `dogfood_stub` |
| Retry key | `idempotency_key` |

Prisma model names are **not** renamed in this pass. Open call: whether system `Obligation` should become `Due` / `Bill` / `AmountDue` later.

## Non-goals (day one)

No neural net, no organisation ERP, no PSP-core, no live remittance-partner / bank integrations.
