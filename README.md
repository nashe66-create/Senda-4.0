# Senda-4.0

B2B purpose-settlement network (UK → Zimbabwe private school fees first).

Partners move the money (`mto_settles`). Senda owns Links, refs, validation, recon, and **proof**.

## App location

The runnable MVP lives in **[`apps/web`](apps/web/)** (Next.js App Router + TypeScript + Prisma + Postgres).

Docs research pack stays in **`docs/senda-4.0/`** (do not wipe).

| | |
| --- | --- |
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

Then open http://localhost:3000 → **Dogfood** for the happy path, or **School login** (`bursar@heritage-demo.zw` / `pilot`) for Biller.

Without Docker, point `DATABASE_URL` in `apps/web/.env` at any Postgres 16 instance (user/db `senda` / password `senda` matches the compose defaults).

## Connect loop

`validate` → `instruct` (frozen destination + unique ref) → `confirm` (stub MTO attest) → recon → `proven` | `needs_reconcile` → proof artifact.

See [`apps/web/README.md`](apps/web/README.md) for curl examples and sandbox API keys.
