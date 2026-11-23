# Runtime and Test Results

**Baseline:** `4bf9ed5dbe46e454baaa176f0c62df634230e173`  
**Audit date:** 23 November 2026

## Recheck environment

- Node: `v24.22.2`
- npm: `11.19.1`
- Docker: `29.9.2-2`
- PostgreSQL: `postgres:16-alpine`
- All database checks used dedicated loopback-only disposable containers.
- No production database, branch, PR or application file was changed.

## Exact commands and results

| Command | Exit/result |
|---|---|
| `git rev-parse HEAD` | `4bf9ed5dbe46e454baaa176f0c62df634230e173` |
| `git rev-list --all --count` | `43` |
| `cd apps/web && npm ci --ignore-scripts --no-audit --no-fund` | 0; 372 locked packages |
| `cd apps/web && DATABASE_URL='...127.0.0.1:1...' npx prisma validate` | 0; schema valid |
| `cd apps/web && npx prisma generate` | 0; Prisma Client 6.19.3 |
| `cd apps/web && npm run lint` | 0 |
| `cd apps/web && npx tsc --noEmit` | 0 after generation |
| `cd apps/web && npm run build` | 0; Next production build passed |
| `python3 docs/senda-4.0/testing/scripts/validate_pack.py` | 0; `OK cases=95` |
| `cd apps/web && npm test` | 1; missing script |
| `cd apps/web && npm audit --omit=dev --audit-level=low` | 1; 6 vulnerabilities, 1 moderate/5 high |
| Docker disposable migration/seed recheck | 0; sole migration applied and fixture seed completed |
| Loopback Next dev server recheck | 200 root, auth and API evidence below |

## Established isolated runtime

The prior isolated check used container `senda40-audit-postgres-20261123`, port `55439`, migration deploy, seed and Next server on loopback port 3000.

Established results:

- unauthenticated validate: 401;
- unauthenticated dogfood happy: 200 and synthetic proof;
- two distinct retry keys for one bill: 200, two attempt IDs;
- Partner A key and Partner B key shared the same retry key: 200, same attempt;
- unauthenticated handoff: 200;
- `/pilot`: configured key present;
- forged Biller cookie: `/biller` and proof route 200;
- container/server removed.

## Independent recheck

Second isolated container:

```sh
docker run --rm -d --name senda40-audit-postgres-20261123b \
  -e POSTGRES_USER=audit -e POSTGRES_PASSWORD=audit \
  -e POSTGRES_DB=audit -p 127.0.0.1:55440:5432 postgres:16-alpine

DATABASE_URL='postgresql://audit:audit@127.0.0.1:55440/audit?schema=public' \
  npx prisma migrate deploy

DATABASE_URL='postgresql://audit:audit@127.0.0.1:55440/audit?schema=public' \
  SANDBOX_API_KEY='audit_recheck_key' \
  SANDBOX_API_KEY_BANK_ONLY='audit_recheck_bank' \
  SANDBOX_API_KEY_NO_ZW='audit_recheck_nzw' npm run db:seed

npm run dev -- --hostname 127.0.0.1 --port 3001
```

Requests:

```text
ROOT=200
UNAUTH_VALIDATE=401
DISTINCT_INSTRUCT_1=cmwt692e000018jij72pf9bke
DISTINCT_INSTRUCT_2=cmwt692g400058jij2o0ldyz
PARTNER_A_INSTRUCT=cmwt692jj00098jijnz0dfb7u
PARTNER_B_REPLAY=same attempt cmwt692jj00098jijnz0dfb7u
HANDOFF=200
PILOT_KEY_PRESENT=yes
FORGED_Biller=200
FORGED_PROOF=404
```

The second container and server were stopped/removed. The forged proof ID targeted another attempt and correctly returned 404, while `/biller` confirmed the forged session.

## Dependency result

`npm audit --omit=dev --audit-level=low` on 23 November 2026 reported:

- `deepmerge-ts <8.0.0`, high;
- `effect <=3.22.0`, high;
- `postcss <=8.5.22`, high through Next;
- total 6 vulnerabilities: 1 moderate, 5 high.

Npm recommended breaking Prisma/Next upgrades via `npm audit fix --force`; no dependency change was made.

## Test coverage

- Build/lint/typecheck: passed.
- Prisma validate/migrate/seed: passed in disposable DB.
- Test pack validator: 95 cases structurally valid.
- App tests: no script or tracked test files.
- Browser automation: not performed.
- Concurrent load test: not performed; sequential duplicate and replay reproduced.
- Live partner/rail: not performed.

## Isolation

No destructive seed or migration reset was run against root Compose, unknown databases or production. No `/tmp` scratch file was created for this audit. The only audit worktree changes are Markdown under `docs/senda-4.0/audits/full-audit/`.
