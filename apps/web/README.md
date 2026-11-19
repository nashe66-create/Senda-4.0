# Senda 4.0 — web app (`apps/web`)

Next.js App Router + TypeScript + Prisma + Postgres.

**Product loop:** Institution → SettleDestination → Beneficiary → Link → Obligation → Attempt → Instruction → Confirmation → Proof.

**Surfaces:** Connect (partner API key), Biller (school stub login), Dogfood UI (no live MTO).

**How it works (product spec):** [`../../docs/senda-4.0/product/how-it-works.md`](../../docs/senda-4.0/product/how-it-works.md)

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
| Dogfood | `/dogfood` | Run validate→instruct→confirm→proof |
| Biller | `/biller` | Login at `/login` |
| School login | `/login` | `bursar@heritage-demo.zw` / `pilot` |

### Connect API (sandbox)

Base: `http://localhost:3000/api/v1/connect`

Header: `Authorization: Bearer sk_sandbox_mukuru_demo`

```bash
# Validate
curl -s -X POST localhost:3000/api/v1/connect/validate \
  -H "Authorization: Bearer sk_sandbox_mukuru_demo" \
  -H "content-type: application/json" \
  -d '{"link_code":"HDA-ADA-001","obligation_id":"obl_001","amount":"850.00","destination_type":"bank_usd"}'

# Instruct (idempotent via idempotency_key)
curl -s -X POST localhost:3000/api/v1/connect/instruct \
  -H "Authorization: Bearer sk_sandbox_mukuru_demo" \
  -H "content-type: application/json" \
  -d '{"link_code":"HDA-ADA-001","obligation_id":"obl_001","amount":"850.00","idempotency_key":"demo-1","destination_type":"bank_usd"}'

# Confirm (stub MTO attest — idempotent)
curl -s -X POST localhost:3000/api/v1/connect/confirm \
  -H "Authorization: Bearer sk_sandbox_mukuru_demo" \
  -H "content-type: application/json" \
  -d '{"attempt_id":"<from instruct>","customer_reference":"<from instruct>","amount":"850.00","currency":"USD","partner_payment_id":"MTO-1"}'
```

Rejected destination types (`cash_pickup`, relative EcoCash, `paynow`, `zipit`) return `destination_rejected`. Partner capability / corridor mismatches return `partner_capability_mismatch` or `corridor_not_supported`.

### Fixture (from `docs/senda-4.0/testing/fixtures/pilot-zw.yaml`)

- School: Heritage Demo Academy (`inst_heritage_demo`)
- Destinations: `bank_usd` + school `ecocash`
- Students / Links: Ada `HDA-ADA-001`, Ben `HDA-BEN-002`
- Obligations: `obl_001`, `obl_002` (open); `obl_stale` (rejected on validate)

### Proofs

JSON written under `apps/web/proofs/` (local stub of S3-compatible object storage). Swap `src/lib/proofs.ts` for real S3/R2 later.

## Non-goals (day one)

No neural net, no school ERP, no PSP-core, no live MTO/bank integrations.
