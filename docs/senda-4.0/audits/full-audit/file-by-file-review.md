# File-by-File Review

**Baseline:** `4bf9ed5dbe46e454baaa176f0c62df634230e173`  
**Method:** exact `git ls-files` inventory (88 tracked files), source review, branch-tip comparison and line review of relevant executable/database/configuration files.

## Main inventory

The audit read/reviewed all 88 main tracked paths. Static SVG/favicon placeholders and binary assets received generated/metadata review; executable/configuration/documentation files received source or substantive section review.

### Application entry points and APIs

| Path | Finding |
|---|---|
| `apps/web/src/app/api/v1/biller/login/route.ts` | Direct password stub and unsigned cookie. |
| `apps/web/src/app/api/v1/biller/proofs/[attemptId]/route.ts` | Relies on forgeable Biller cookie for institution scope. |
| `apps/web/src/app/api/v1/connect/validate/route.ts` | Partner-authenticated and Zod-validated; domain checks lack executable tests. |
| `apps/web/src/app/api/v1/connect/instruct/route.ts` | Partner-authenticated; key aliases accepted. |
| `apps/web/src/app/api/v1/connect/confirm/route.ts` | Partner-authenticated; timestamp lacks strict validation. |
| `apps/web/src/app/api/v1/dogfood/run/route.ts` | Public mutations and synthetic proof. |
| `apps/web/src/app/api/v1/pilot/handoff/route.ts` | Public attempt-ID data disclosure. |

### Libraries

| Path | Finding |
|---|---|
| `apps/web/src/lib/auth.ts` | Partner hash lookup exists; Biller sessions are Base64 JSON. |
| `apps/web/src/lib/connect.ts` | Core domain logic; duplicate, replay and evidence issues. |
| `apps/web/src/lib/proofs.ts` | Local filesystem proof stub. |
| `apps/web/src/lib/partner-request.ts` | Retry-key alias extraction only. |
| `apps/web/src/lib/api.ts` | Stable JSON/error wrapper. |
| `apps/web/src/lib/db.ts` | Shared Prisma client. |
| `apps/web/src/lib/ui-labels.ts` | Overstates confirmed/proven semantics. |

### UI

| Path | Finding |
|---|---|
| `apps/web/src/app/biller/page.tsx` | Thin read-only institution view; tenant scope depends on Biller cookie. |
| `apps/web/src/app/login/page.tsx` | Demo credential UI. |
| `apps/web/src/app/pilot/page.tsx` | Server key can reach browser. |
| `apps/web/src/app/pilot/pilot-client.tsx` | Calls partner APIs directly from browser. |
| `apps/web/src/app/dogfood/dogfood-client.tsx` | Public synthetic loop surface. |
| `apps/web/src/app/dogfood/page.tsx` | Public fixture listing. |
| `apps/web/src/app/page.tsx` | Navigation only. |
| `apps/web/src/app/layout.tsx` | Standard shell. |
| `apps/web/src/app/globals.css` | Styling only. |

### Database

| Path | Finding |
|---|---|
| `apps/web/prisma/schema.prisma` | School-specific and incomplete history/concurrency model. |
| `apps/web/prisma/migrations/20261119092035_init_domain/migration.sql` | Successful initial DDL; globally unique retry key; restricted cascades. |
| `apps/web/prisma/migrations/migration_lock.toml` | PostgreSQL provider lock. |
| `apps/web/prisma/seed.ts` | Destructive and fixture-only. |

### Configuration and build

| Path | Finding |
|---|---|
| `apps/web/package.json` | No test script; build/lint scripts exist. |
| `apps/web/package-lock.json` | 372 packages installed; advisory scan found 6. |
| `apps/web/.env.example` | Demo/session placeholders; `BILLER_SESSION_SECRET` unused. |
| `apps/web/next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `tsconfig.json` | Standard config; lint/type/build passed. |
| `docker-compose.yml` | Fixed credentials and non-loopback-published Postgres port. |

### Documentation and test pack

The canonical product docs describe a sandbox, ops-assisted wedge and no live partner/rail integration. The 95-case YAML pack is structurally valid but not executable against the app.

Key files: `docs/senda-4.0/product/*.md`, `docs/senda-4.0/research/*.md`, `docs/senda-4.0/testing/**`, `docs/senda-4.0/work-plan.md`.

Legacy redirect files `docs/project-context.md`, `docs/senda-4-work-plan.md`, `senda/docs/*.md` point to canonical content and do not implement behavior.

### Static assets

`apps/web/public/*.svg`, `apps/web/src/app/favicon.ico`, `apps/web/proofs/.gitkeep` are placeholders/generated assets or empty directories; no security-relevant executable behavior was found.

## Branch-only docs

- `origin/cursor/onboarding-dues-scenarios-53ef:docs/senda-4.0/product/onboarding-dues-scenarios.md`: branch-only decision scenarios, no implementation. It makes stale/local payments and double pay an explicit design constraint and recommends ops-assisted onboarding and one-active-attempt policy.
- `origin/docs/kuva-cash-feedback-nov18:docs/senda-4.0/research/kuva-cash-feedback.md`: single-conversation directional note, not partner or bursar validation. It raises cash receipt, regulatory perimeter, cousin cost, MTO willingness and EcoCash competition.

No branch-only application, schema or migration file was found.

## Verification status

- 88/88 main paths enumerated.
- Relevant unique executable/database/configuration files read.
- Branch-only docs inspected.
- Static assets limited to metadata/binary review.
- No application or migration change was made.
