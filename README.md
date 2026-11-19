# Senda-4.0

B2B purpose-settlement network (first wedge: UK → Zimbabwe private school fees; same pattern for other billers later).

Remittance partners move the money (`mto_settles`). Senda owns pay codes (Links), payment references, validation, recon, and **payment proof**.

## App location

The runnable MVP lives in **[`apps/web`](apps/web/)** (Next.js App Router + TypeScript + Prisma + Postgres).

Docs research pack stays in **`docs/senda-4.0/`** (do not wipe).

| | |
| --- | --- |
| Connect concepts (wording map) | [`docs/senda-4.0/product/connect-concepts.md`](docs/senda-4.0/product/connect-concepts.md) |
| Product spec | [`docs/senda-4.0/product/how-it-works.md`](docs/senda-4.0/product/how-it-works.md) |
| Work plan | [`docs/senda-4.0/work-plan.md`](docs/senda-4.0/work-plan.md) |
| Lock test pack | [`docs/senda-4.0/testing/`](docs/senda-4.0/testing/README.md) |
| App runbook | [`apps/web/README.md`](apps/web/README.md) |

**#9 stack (LOCKED):** Next.js App Router + TypeScript + Postgres; partner API keys + school/ops auth; S3-compatible proofs (local stub); Biller beside school systems; no NN / no ERP / no PSP-core day one.

**#10 settle (LOCKED):** Connect destinations = `bank_usd` + school-owned `ecocash`. Reject cash / relative wallets / Paynow / ZIPIT as Connect destinations.

## Quick start

```bash
# 1. Postgres
docker compose up -d postgres

# 2. App
cd apps/web
cp .env.example .env
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Then open http://localhost:3000 → **Pilot** (`/pilot`) for the partner walkthrough, **Test loop** for one-click engineering checks, or **Biller login** (`bursar@heritage-demo.zw` / `pilot`). Runbook: [`docs/senda-4.0/product/pilot-runbook.md`](docs/senda-4.0/product/pilot-runbook.md).

Without Docker, point `DATABASE_URL` in `apps/web/.env` at any Postgres 16 instance (user/db `senda` / password `senda` matches the compose defaults).

## Connect loop

`validate` → `instruct` (frozen payout + unique payment reference) → `confirm` (partner or test attestation) → recon → **confirmed** (`proven`) or **needs a check** (`needs_reconcile`) → payment proof.

See [`apps/web/README.md`](apps/web/README.md) for curl examples and sandbox API keys.
