# Security Audit

**Baseline:** `4bf9ed5dbe46e454baaa176f0c62df634230e173`  
**Audit date:** 23 November 2026

## Prior finding recheck

All listed prior findings were independently rechecked against source and the disposable loopback runtime.

| ID | Prior risk | Status | Evidence |
|---|---|---|---|
| SEC-01 | Unsigned/forgeable biller session | CONFIRMED | Base64URL JSON without MAC: `apps/web/src/lib/auth.ts:65-96`; login: `apps/web/src/app/api/v1/biller/login/route.ts:20-47`. Forged-cookie `/biller` and proof-route checks returned 200/404 depending target. |
| SEC-02 | Partner-scoped idempotency | CONFIRMED | Global unique key and key-only lookup: `apps/web/prisma/schema.prisma:236`; migration line 256; `apps/web/src/lib/connect.ts:372-400`. Partner B replayed Partner A key and received the same attempt and instruction. |
| SEC-03 | Pilot handoff IDOR | CONFIRMED | Unauthenticated attempt-ID lookup: `apps/web/src/app/api/v1/pilot/handoff/route.ts:11-98`. GET returned 200 for fixture attempt. |
| SEC-04 | Confirmation/evidence semantics | CONFIRMED | Reference/amount/currency match is promoted to proven without credit/allocation evidence: `apps/web/src/lib/connect.ts:526-527,632-743`; UI: `ui-labels.ts:8-13`. |
| SEC-05 | Proof storage | CONFIRMED | Local filesystem write before transaction commit: `apps/web/src/lib/proofs.ts:9-21`; caller lines 659-740. |
| SEC-06 | Seed data loss | CONFIRMED | Destructive deleteMany with no environment guard: `apps/web/prisma/seed.ts:20-31`. |
| SEC-07 | Duplicate instructions | CONFIRMED | Two retry keys for one bill produced two attempt IDs. |
| SEC-08 | Dependency advisories | CONFIRMED | `npm audit --omit=dev --audit-level=low` reports 6 advisories: 1 moderate, 5 high. |

## Additional security findings

### SEC-09 — Browser-held partner credential

**Severity:** High/P1. **Status:** CONFIRMED.

`apps/web/src/app/pilot/page.tsx:6-12,100` passes `SANDBOX_API_KEY` or fallback to client props; `pilot-client.tsx:79,101` sends it as bearer auth. Loopback recheck found `audit_recheck_key` in `/pilot` HTML/RSC. Never configure a real reusable key. Fix with server-only demo proxy or a partner/user-supplied credential and production disablement.

### SEC-10 — Unauthenticated synthetic dogfood writes

**Severity:** High/P1. **Status:** CONFIRMED.

`apps/web/src/app/api/v1/dogfood/run/route.ts:28-83` performs validate/instruct/confirm/proof writes without authorization or mode guard. Earlier isolated recheck returned 200 and `proof_issued: true`; a later stale-bill recheck correctly returned 400, but this does not fix exposure. Remove or require explicit demo mode and authentication.

### SEC-11 — No app rate limiting

**Severity:** Medium/P2. **Status:** SUSPECTED/NOT ESTABLISHED at edge.

No `middleware.ts`, limiter or route throttle appears in the tracked app. This is conditional on platform controls not present in repository. Fix: IP/principal limits, auth failure monitoring and write bounds.

### SEC-12 — Password stub

**Severity:** High/P1 for real deployment. **Status:** CONFIRMED.

Seed stores `passwordStub: "pilot"` and login uses direct `timingSafeEqual`/string comparison (`apps/web/prisma/seed.ts:86-92`; `apps/web/src/app/api/v1/biller/login/route.ts:13-47`). This is not password storage. Fix with Argon2id/bcrypt and account lock/rate controls.

### SEC-13 — Compose exposure

**Severity:** Medium/P2. **Status:** CONFIRMED configuration.

`docker-compose.yml:3-10` uses fixed credentials and publishes 5432 without loopback binding. Bind to `127.0.0.1`, use local-only secrets and never reuse fixture credentials.

### SEC-14 — Confirmation validation/lifecycle

**Severity:** Medium/P2. **Status:** CONFIRMED.

`settled_at` is unconstrained Zod string and converted to `Date` without route validity or future-range checks. No explicit attempt-state guard appears before proof. Fix ISO 8601 validation and DB/transaction state-transition checks.

## Runtime evidence

Exact recheck commands:

```sh
docker run --rm -d --name senda40-audit-postgres-20261123b \
  -e POSTGRES_USER=audit -e POSTGRES_PASSWORD=audit -e POSTGRES_DB=audit \
  -p 127.0.0.1:55440:5432 postgres:16-alpine

DATABASE_URL='postgresql://audit:audit@127.0.0.1:55440/audit?schema=public' \
  npx prisma migrate deploy

DATABASE_URL='postgresql://audit:audit@127.0.0.1:55440/audit?schema=public' \
  SANDBOX_API_KEY='audit_recheck_key' npm run db:seed

npm run dev -- --hostname 127.0.0.1 --port 3001
```

Results:

- unauthenticated validate: 401;
- same bill, distinct retry keys: two attempt IDs;
- Partner A instruct then Partner B same-key replay: Partner B received Partner A attempt and frozen destination;
- handoff GET: 200;
- `/pilot`: browser key present;
- forged Biller cookie: `/biller` 200;
- root: 200.

The audit Docker container and server were stopped and removed.

## Dependency evidence

`npm audit --omit=dev --audit-level=low` result:

- deepmerge-ts: high stack exhaustion;
- effect: high ReDoS;
- postcss via Next: high source-map/XSS/path traversal advisories;
- 6 total: 1 moderate, 5 high.

Npm recommends breaking Prisma/Next upgrades via `npm audit fix --force`. Status: **CONFIRMED**, remediation not implemented.

## Release gate

No real partner, biller or personal data before SEC-01 through SEC-10 are fixed and independently tested.
