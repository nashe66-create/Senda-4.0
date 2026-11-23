# Senda 4.0 repository inventory

## Scope and method

- **Audit target:** `main` at `4bf9ed5dbe46e454baaa176f0c62df634230e173` (verified as exact `HEAD` before this audit).
- **Tree source:** `git ls-files`, `git ls-tree -r`, and `git ls-files -s`; 88 tracked file blobs, all mode `100644` except the executable pilot script (`100755`).
- **Working state at start:** `main` tracked `origin/main`; there were no tracked changes. The existing `docs/senda-4.0/audits/full-audit/` report directory was untracked. No application code or Git refs/index were changed.
- **Read-status key:** **Full** = entire file inspected; **Partial** = relevant content or substantial sections inspected, not every line; **Header/metadata** = path, file type and/or headings only; **Generated/read-only** = generated or binary asset not line-readable. Read status is about the audit, not test coverage.
- **Audit status:** “Reviewed” denotes static inspection, not proof of production readiness. “Gap” and “partial” identify explicit outstanding work. Dependency column gives direct/runtime or principal documentary dependencies, not every transitive npm dependency.

The current inventory is complete by path (88/88). Read status is deliberately not overstated: several long research, scenario, style, and scaffold files received a metadata/section review rather than line-by-line review. See individual rows. The historical one-page audit remains unchanged; this inventory supplements it.

## Tracked files

| Path | Type; exec/config/docs/test/generated | Purpose | Read status | Principal dependencies / references | Audit status |
|---|---|---|---|---|---|
| `.gitignore` | Git config | Excludes local build, env and proof artifacts | Full | Git; `apps/web/.gitignore` | Reviewed; no secrets tracked by this file |
| `README.md` | Project documentation | Product summary, local app pointers | Partial | `apps/web/README.md`; docs index | Reviewed; describes sandbox, not live rails |
| `apps/web/.env.example` | Runtime config example | Database, proof directory, demo partner keys, session-secret example | Full | Next.js/Prisma env | Reviewed; contains demo defaults only; `BILLER_SESSION_SECRET` is not used by current auth code |
| `apps/web/.gitignore` | Runtime config | Ignores env, build, local proof and generated Prisma files | Full | Git, Next.js | Reviewed |
| `apps/web/README.md` | App documentation | Local setup, API, fixture, surfaces and demo credentials | Partial | `package.json`, Prisma, docs/runbook | Reviewed; explicitly documents demo state; do not treat demo credentials as deployable |
| `apps/web/eslint.config.mjs` | Lint config | Next.js ESLint flat configuration | Full | ESLint, `@eslint/eslintrc` | Reviewed; lint not run |
| `apps/web/next.config.ts` | Runtime config | Next.js configuration defaults | Full | Next.js | Reviewed |
| `apps/web/package-lock.json` | Dependency lock; generated | Locks npm dependency graph | Header/metadata | `apps/web/package.json`; npm registry | Root package set read; complete transitive lock not line-reviewed; install/audit not run |
| `apps/web/package.json` | Dependency/runtime config | Scripts and Next/React/Prisma/Zod dependencies | Full | Node 20+, npm, PostgreSQL | Reviewed; app build/lint not run |
| `apps/web/postcss.config.mjs` | Build config | Tailwind PostCSS plugin | Full | Tailwind/PostCSS | Reviewed |
| `apps/web/prisma/migrations/20261119092035_init_domain/migration.sql` | Database migration; generated SQL | Creates initial Postgres enums, tables, indexes and constraints | Partial | Prisma schema; PostgreSQL | Initial DDL sampled; no migration applied; schema/migration drift not fully checked |
| `apps/web/prisma/migrations/migration_lock.toml` | Migration config | Pins migration provider to PostgreSQL | Full | Prisma Migrate | Reviewed |
| `apps/web/prisma/schema.prisma` | Database schema/config | Partner, institution, destination, beneficiary, link, obligation, attempt, instruction, confirmation and proof models | Full | Prisma Client; migration SQL | Reviewed; school-specific; attempt retry key is globally unique; no obligation version history |
| `apps/web/prisma/seed.ts` | Fixture/data script | Destructively clears domain tables, then creates demo partner, school, destinations, users, pay codes and obligations | Full | Prisma schema; `DATABASE_URL`; example keys | Reviewed; destructive and has plaintext demo password; safe only in isolated fixture DB |
| `apps/web/proofs/.gitkeep` | Empty placeholder | Keeps local proof directory in Git | Generated/empty | `proofs.ts`; `.gitignore` | Reviewed; no generated proof artifacts tracked |
| `apps/web/public/file.svg` | Static asset; scaffold | Next.js starter icon | Generated/read-only | None found | Header/metadata; no app-specific dependency |
| `apps/web/public/globe.svg` | Static asset; scaffold | Next.js starter icon | Generated/read-only | None found | Header/metadata; no app-specific dependency |
| `apps/web/public/next.svg` | Static asset; scaffold | Next.js starter logo | Generated/read-only | None found | Header/metadata; no app-specific dependency |
| `apps/web/public/vercel.svg` | Static asset; scaffold | Vercel starter logo | Generated/read-only | None found | Header/metadata; no app-specific dependency |
| `apps/web/public/window.svg` | Static asset; scaffold | Next.js starter icon | Generated/read-only | None found | Header/metadata; no app-specific dependency |
| `apps/web/src/app/api/v1/biller/login/route.ts` | Runtime API | Biller login/logout and cookie issue/removal | Full | `auth.ts`, Prisma, API helpers, `SchoolUser` | Reviewed; Base64URL cookie is unsigned, plaintext stub password comparison, no explicit Secure flag |
| `apps/web/src/app/api/v1/biller/proofs/[attemptId]/route.ts` | Runtime API | Returns stored proof for attempts belonging to cookie institution | Full | `auth.ts`, Prisma, local filesystem, API helpers | Reviewed; tenant check relies on forgeable cookie; local path storage is not durable |
| `apps/web/src/app/api/v1/connect/confirm/route.ts` | Runtime API | Authenticated partner confirmation endpoint | Full | `auth.ts`, `connect.ts`, Zod, API helpers | Reviewed; only partner attestation; request accepts arbitrary string `settled_at` |
| `apps/web/src/app/api/v1/connect/instruct/route.ts` | Runtime API | Authenticated instruction creation and retry-key parsing | Full | `auth.ts`, `connect.ts`, `partner-request.ts`, Zod | Reviewed; retry key not partner-scoped in backing model/lookup |
| `apps/web/src/app/api/v1/connect/validate/route.ts` | Runtime API | Authenticated obligation/destination validation | Full | `auth.ts`, `connect.ts`, Prisma enums, Zod | Reviewed; no currency/destination compatibility check identified |
| `apps/web/src/app/api/v1/dogfood/run/route.ts` | Runtime API; demo | Public fixture-only validate/instruct/test-confirm/proof workflow | Full | Prisma, `connect.ts`, API helpers, Zod | Reviewed; unauthenticated mutating demo route; no live-mode guard |
| `apps/web/src/app/api/v1/pilot/handoff/route.ts` | Runtime API; demo | Reads attempt and returns beneficiary, bill, partner and proof/handoff details | Full | Prisma, UI labels, API helpers | Reviewed; unauthenticated ID-based disclosure; no deployment-mode guard |
| `apps/web/src/app/biller/logout-button.tsx` | Runtime UI | Calls logout and navigates to login | Partial | Biller login API; Next router | Reviewed; logout does not repair underlying session integrity issue |
| `apps/web/src/app/biller/page.tsx` | Runtime UI/server page | Biller dashboard, destination checks, obligations, attempts and proof links | Partial | Prisma, `auth.ts`, UI labels, logout component | Reviewed; server-side data access scopes by cookie institution; cookie is forgeable |
| `apps/web/src/app/dogfood/dogfood-client.tsx` | Runtime UI/client | Runs happy/mismatch demo and displays test confirmation | Partial | Dogfood API; UI labels | Reviewed; output terminology still maps partner attestation to “confirmed/proven” |
| `apps/web/src/app/dogfood/page.tsx` | Runtime UI/server page | Lists open fixture obligations and renders dogfood client | Partial | Prisma; dogfood client | Reviewed; publicly lists demo beneficiary/account references |
| `apps/web/src/app/favicon.ico` | Binary static asset; scaffold | Browser favicon | Generated/read-only | Next.js asset convention | Binary not semantically reviewed |
| `apps/web/src/app/globals.css` | Runtime styling | Global palette and shared UI classes | Partial | Tailwind CSS | Style not exhaustively reviewed |
| `apps/web/src/app/layout.tsx` | Runtime UI/layout | Shared fonts, navigation, metadata and shell | Partial | Next.js, `next/font`, global CSS | Reviewed; font loading is build/runtime dependent and untested here |
| `apps/web/src/app/login/page.tsx` | Runtime UI/client | Biller demo login form | Partial | Biller login API; Next router | Reviewed; explicitly exposes demo login in UI |
| `apps/web/src/app/page.tsx` | Runtime UI | Home page and links to pilot/Biller/dogfood | Partial | Next Link | Reviewed |
| `apps/web/src/app/pilot/page.tsx` | Runtime UI/server page | Builds guided demo data and passes sandbox key to client | Partial | Prisma, `pilot-client.tsx`, environment | Reviewed; full sandbox key is passed to browser; unsafe if a non-demo key is configured |
| `apps/web/src/app/pilot/pilot-client.tsx` | Runtime UI/client | Calls validate/instruct/confirm and handoff APIs for guided demo | Partial | Connect APIs, handoff API, UI labels | Reviewed; browser holds sandbox key; no production-mode restriction observed |
| `apps/web/src/lib/api.ts` | Runtime library | Stable JSON response and route error helpers | Full | NextResponse, Zod, `connect.ts` | Reviewed |
| `apps/web/src/lib/auth.ts` | Runtime library | Partner-key hashing/checks and Biller cookie encode/decode | Full | Node crypto, Next cookies, Prisma | Reviewed; partner auth uses SHA-256 lookup; Biller cookie is unsigned, trusts claims and has no expiry/revocation |
| `apps/web/src/lib/connect.ts` | Runtime domain logic | Destination eligibility, validation, instruction/replay and confirmation/proof workflow | Full | Prisma, `db.ts`, `proofs.ts` | Reviewed; cross-partner retry replay risk; accepts already-`instructed` obligations and does not enforce one active attempt; no confirm eligible-state guard; proof means matching partner attestation, not independent credit/allocation |
| `apps/web/src/lib/db.ts` | Runtime library | Shared Prisma client | Full | Prisma Client, `DATABASE_URL` | Reviewed |
| `apps/web/src/lib/partner-request.ts` | Runtime library | Reads retry keys from body/header aliases | Full | Web Request API | Reviewed; no key scoping itself |
| `apps/web/src/lib/proofs.ts` | Runtime library | Writes proof JSON under local proof directory | Full | Node filesystem, `PROOF_STORAGE_DIR` | Reviewed; local/ephemeral storage; file write occurs inside DB transaction |
| `apps/web/src/lib/ui-labels.ts` | Runtime UI library | Maps internal states and destinations to copy | Full | Product glossary | Reviewed; `proven` is labelled “Confirmed,” which risks overstating attestation |
| `apps/web/tsconfig.json` | TypeScript config | Strict TS, Next plugin, alias mapping | Full | TypeScript, Next.js | Reviewed; typecheck not run |
| `docker-compose.yml` | Local runtime config | Local PostgreSQL 16 container and persistent volume | Full | Docker Compose, PostgreSQL | Reviewed; local demo password is not for deployment; DB not started |
| `docs/project-context.md` | Documentation redirect | Points to canonical context | Partial | `docs/senda-4.0/context/project-context.md` | Reviewed |
| `docs/senda-4-work-plan.md` | Documentation redirect | Points to canonical work plan | Partial | `docs/senda-4.0/work-plan.md` | Reviewed |
| `docs/senda-4.0/README.md` | Documentation index | Canonical docs index and locked decisions | Partial | Product/research docs, app README | Reviewed by header/links; no broken-link sweep |
| `docs/senda-4.0/audits/2026-11-23-repository-audit.md` | Audit documentation | Prior strategic/source audit and acknowledged outstanding forensic work | Full | Source/docs/branch observations | Reviewed; preserved; its “in progress” claims are superseded only where these companion docs provide new evidence |
| `docs/senda-4.0/context/project-context.md` | Product documentation | Product premise, scope and decisions #9/#10 | Partial | Docs index, Connect glossary, BBPS study | Reviewed |
| `docs/senda-4.0/pivot.md` | Product documentation | Pivot from consumer remittance to purpose-payment infrastructure | Partial | Work plan and docs index | Reviewed |
| `docs/senda-4.0/product/connect-concepts.md` | Product/engineering documentation | Glossary, conceptual model and pseudocode | Partial | Product glossary; current app | Reviewed by headings/selected sections; terminology vs proof-state concern remains |
| `docs/senda-4.0/product/connect-partner-sandbox.md` | Integration documentation | Partner API contract and sandbox instructions | Partial | Connect routes; app README; concepts | Reviewed by sections/patch; docs are sandbox, not production integration evidence |
| `docs/senda-4.0/product/how-it-works.md` | Product specification | End-to-end lifecycle and locked business scope | Partial | Context, concepts, research | Reviewed by headings/selected sections |
| `docs/senda-4.0/product/pilot-runbook.md` | Operations documentation | Guided demo and test script instructions | Partial | Pilot UI, script, app README | Reviewed by headings and recent patch |
| `docs/senda-4.0/product/scripts/pilot-loop.sh` | Shell script; executable; demo | Curl-based happy/mismatch end-to-end loop | Partial | Connect APIs, `curl`, shell, environment | Mode `100755`; script logic/default fix inspected; not executed |
| `docs/senda-4.0/research/bbps-india.md` | Research documentation | Bharat Connect/BBPS reference model | Header/metadata | Research sources referenced in document | Claim/source validation not performed |
| `docs/senda-4.0/research/cousin-path-metrics.md` | Research documentation | Public-web proxies for diversion/failure | Header/metadata | School receipt, demand research | Claims are proxies; source-level verification remains outstanding |
| `docs/senda-4.0/research/demand-mto-diaspora.md` | Research documentation | MTO/diaspora demand evidence and open questions | Header/metadata | Research plan, product spec | No partner interviews; public-claim verification outstanding |
| `docs/senda-4.0/research/lock-brief.md` | Research/decision documentation | Decision status for wedge and locks #9/#10 | Header/metadata | Demand, supply, rails, wedge research | Founder decisions documented; independent validation not established |
| `docs/senda-4.0/research/rails-and-stack.md` | Research documentation | Stack and settlement-rail assessment | Header/metadata | Research plan, schema, product scope | No live rail or partner integration evidence |
| `docs/senda-4.0/research/research-plan.md` | Research planning documentation | Workstreams and questions for locking decisions | Header/metadata | Research docs | Reviewed by heading |
| `docs/senda-4.0/research/school-received-confirmation.md` | Research documentation | Evidence options and distinction between partner attestation and school receipt | Partial | How-it-works, rails, scenario catalog | Reviewed by heading; supports recommendation to distinguish evidence levels |
| `docs/senda-4.0/research/supply-zw-schools.md` | Research documentation | School supply, dues hygiene and onboarding questions | Header/metadata | Research plan, product spec | No school/bursar interviews per document; claims not independently validated |
| `docs/senda-4.0/research/wedge-comparison.md` | Research documentation | School/medical/funeral/utilities wedge comparison | Header/metadata | Demand/supply/rails research | Research conclusions remain hypotheses |
| `docs/senda-4.0/testing/README.md` | Test-pack documentation | Describes structured scenario pack | Partial | YAML cases, validator, docs pack | Pack validation passed; cases are not application integration tests |
| `docs/senda-4.0/testing/agents/README.md` | Test-pack documentation | How to use agent briefs | Partial | Agent brief files, validator | Read by heading; briefs are guidance, not executable tests |
| `docs/senda-4.0/testing/agents/briefs/agent-corridor-wedge.md` | Test brief; test documentation | Corridor and wedge checks CR-01–06 | Header/metadata | YAML cases | Brief exists; no API test execution |
| `docs/senda-4.0/testing/agents/briefs/agent-docs-path.md` | Test brief; test documentation | Docs path checks DOC-01–04 | Header/metadata | YAML cases, docs tree | File-path subset is partly executed by validator |
| `docs/senda-4.0/testing/agents/briefs/agent-dogfood.md` | Test brief; test documentation | Dogfood scenarios DF-01–05 | Header/metadata | Dogfood API/UI, YAML cases | Not run against app |
| `docs/senda-4.0/testing/agents/briefs/agent-freshness-scope.md` | Test brief; test documentation | Freshness and local-payer scope FR/LP | Header/metadata | YAML cases | Not run against app |
| `docs/senda-4.0/testing/agents/briefs/agent-full-matrix.md` | Test brief; test documentation | Full structured-case sweep instructions | Header/metadata | YAML cases, validator | Not an executable integration suite |
| `docs/senda-4.0/testing/agents/briefs/agent-links-confirm.md` | Test brief; test documentation | Link and confirmation cases LK-01–10 | Header/metadata | YAML cases | Not run against app |
| `docs/senda-4.0/testing/agents/briefs/agent-pricing-outreach.md` | Test brief; test documentation | Pricing/outreach policy cases | Header/metadata | YAML cases | Not run against app |
| `docs/senda-4.0/testing/agents/briefs/agent-recon-disputes.md` | Test brief; test documentation | Reconciliation, dispute, abuse and ops cases | Header/metadata | YAML cases | Not run against app |
| `docs/senda-4.0/testing/agents/briefs/agent-settle-connect.md` | Test brief; test documentation | Destination and Connect cases | Header/metadata | YAML cases | Not run against app |
| `docs/senda-4.0/testing/agents/briefs/agent-stack.md` | Test brief; test documentation | Stack decision cases | Header/metadata | YAML cases | Not run against app |
| `docs/senda-4.0/testing/cases/all-cases.yaml` | Structured test specification; test | 95 declared product/policy scenarios | Header/metadata; validator parsed all | `schema.yaml`, fixture, validator | YAML structure/coverage validated; behavior not executed |
| `docs/senda-4.0/testing/cases/schema.yaml` | Test schema/config | Case fields, domains, types and allowed locks | Partial; validator parsed | `all-cases.yaml`, validator | Schema-level validation passed |
| `docs/senda-4.0/testing/coverage-map.md` | Test documentation | Human-readable lock/scenario coverage | Header/metadata | YAML cases; validator | Validator independently recomputes coverage; document not diff-checked against it |
| `docs/senda-4.0/testing/fixtures/pilot-zw.yaml` | Test fixture/data | Zimbabwe pilot scenario fixture | Header/metadata; validator parsed | Cases, seed, pilot flow | Structure validated; seed/database consistency not integration-tested |
| `docs/senda-4.0/testing/scenario-catalog.md` | Test documentation | Human-readable scenario descriptions | Header/metadata | YAML case list, product decisions | No automatic complete catalog-to-YAML equivalence check |
| `docs/senda-4.0/testing/scripts/validate_pack.py` | Python test/validation tool | Parses YAML, validates fields/coverage/brief presence and limited docs paths | Full | Python 3, PyYAML, test-pack files | Executed successfully: 95 cases, all required locks and briefs present; not an app test runner |
| `docs/senda-4.0/work-plan.md` | Planning documentation | Product plan, scope and decisions | Partial | Docs index, pivot, product/research docs | Reviewed by headings; milestones are plans, not proof of delivery |
| `senda/docs/bbps-india.md` | Legacy redirect documentation | Points to canonical BBPS study | Partial | Canonical research doc, docs index | Reviewed |
| `senda/docs/senda-4.0-pivot.md` | Legacy redirect documentation | Points to canonical pivot | Partial | Canonical pivot, docs index | Reviewed |

## Inventory totals and qualifications

- Main tree: **88 tracked files**; no submodules or vendored source were identified by the tracked-path listing.
- Classification: application source/routes/UI, Prisma schema/migration/fixture, Next/TypeScript/npm/Docker/Git configuration, one executable demo script, research/product/audit docs, and a structured 95-case policy/specification pack. No conventional automated application test files are tracked.
- Generated assets are limited to starter SVG/favicon and dependency-lock/migration artifacts; they are not generated application source in a build directory.
- No binary credential or actual production secret was identified in the tracked path inventory. The example environment and seed include explicitly named demo credentials; they are not safe production credentials.
- Branch-only files do not belong to the exact `HEAD` inventory and are listed separately in `branch-and-pr-audit.md`.
- **External blockers / not evidenced:** no live MTO, bank, EcoCash or school integration credentials; no real payment or independent bank-credit evidence; no legal/regulatory sign-off; no named partner/bursar interview evidence; no app build, lint, typecheck, migration, database flow or browser run in this audit. GitHub PR comment/review/check endpoints were queried for #1–#15 and returned no records; this is endpoint evidence at audit time, not evidence that no historical records ever existed.

## Tracked-file crosswalk for all remote branch tips

The following inventory is a path-level set crosswalk, generated from `git ls-tree -r --name-only <tip>` for all ten actual remote branches. Each path row names every branch tip on which the path exists; absence from the ten-code set means the path is absent at that tip. The `origin/HEAD` symbolic ref is not an eleventh branch. This crosswalk complements (and does not replace) the per-file purpose/read-status inventory above.

| Code | Remote branch | Tip SHA | Tracked files |
|---|---|---|---:|
| B01 | `origin/cursor/add-senda-4-pivot-doc-3bc0` | `285380e99c77c078af17bd66de36aa03b6a4d4bb` | 2 |
| B02 | `origin/cursor/biller-bursar-surface-8d87` | `2561237cb22c4b88c16eb7e959d02fbbd4c12491` | 82 |
| B03 | `origin/cursor/connect-concepts-doc-9c8e` | `6ddca3e13d8b0acd135e3d754a9b3a9d50121662` | 38 |
| B04 | `origin/cursor/connect-partner-hardening-1927` | `941f3c11053068c266228ad64f220d8cd96b1226` | 81 |
| B05 | `origin/cursor/mismatch-kyb-checklist-7986` | `81937eb8b6d7b9ffd5e30d5bded3fa5fe3f3cc8d` | 79 |
| B06 | `origin/cursor/onboarding-dues-scenarios-53ef` | `8d8a1e5d6eeb1d771e58a56b1f8270c9b4be31df` | 88 |
| B07 | `origin/cursor/scaffold-mvp-app-3a57` | `1e4b55df7b1d4f5c8d01bb6f5a34e233530a1e4e` | 77 |
| B08 | `origin/cursor/wedge-pilot-loop-ee1f` | `b45578a8ec94f2ad12acede3f227cef736a4b87b` | 87 |
| B09 | `origin/docs/kuva-cash-feedback-nov18` | `b855f3b8294948e14a62455ccb19d08903e738c8` | 35 |
| B10 | `origin/main` | `4bf9ed5dbe46e454baaa176f0c62df634230e173` | 88 |

| Tracked file path | Present at remote branch tip(s) |
|---|---|
| `.gitignore` | B02, B04, B05, B06, B07, B08, B10 |
| `README.md` | B01, B02, B03, B04, B05, B06, B07, B08, B09, B10 |
| `apps/web/.env.example` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/.gitignore` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/README.md` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/eslint.config.mjs` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/next.config.ts` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/package-lock.json` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/package.json` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/postcss.config.mjs` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/prisma/migrations/20261119092035_init_domain/migration.sql` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/prisma/migrations/migration_lock.toml` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/prisma/schema.prisma` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/prisma/seed.ts` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/proofs/.gitkeep` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/public/file.svg` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/public/globe.svg` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/public/next.svg` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/public/vercel.svg` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/public/window.svg` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/src/app/api/v1/biller/login/route.ts` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/src/app/api/v1/biller/proofs/[attemptId]/route.ts` | B02, B06, B08, B10 |
| `apps/web/src/app/api/v1/connect/confirm/route.ts` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/src/app/api/v1/connect/instruct/route.ts` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/src/app/api/v1/connect/validate/route.ts` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/src/app/api/v1/dogfood/run/route.ts` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/src/app/api/v1/pilot/handoff/route.ts` | B06, B08, B10 |
| `apps/web/src/app/biller/logout-button.tsx` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/src/app/biller/page.tsx` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/src/app/dogfood/dogfood-client.tsx` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/src/app/dogfood/page.tsx` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/src/app/favicon.ico` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/src/app/globals.css` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/src/app/layout.tsx` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/src/app/login/page.tsx` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/src/app/page.tsx` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/src/app/pilot/page.tsx` | B06, B08, B10 |
| `apps/web/src/app/pilot/pilot-client.tsx` | B06, B08, B10 |
| `apps/web/src/lib/api.ts` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/src/lib/auth.ts` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/src/lib/connect.ts` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/src/lib/db.ts` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/src/lib/partner-request.ts` | B02, B04, B06, B08, B10 |
| `apps/web/src/lib/proofs.ts` | B02, B04, B05, B06, B07, B08, B10 |
| `apps/web/src/lib/ui-labels.ts` | B02, B04, B05, B06, B08, B10 |
| `apps/web/tsconfig.json` | B02, B04, B05, B06, B07, B08, B10 |
| `docker-compose.yml` | B02, B04, B05, B06, B07, B08, B10 |
| `docs/project-context.md` | B02, B03, B04, B05, B06, B07, B08, B09, B10 |
| `docs/senda-4-work-plan.md` | B02, B03, B04, B05, B06, B07, B08, B09, B10 |
| `docs/senda-4.0/README.md` | B02, B03, B04, B05, B06, B07, B08, B09, B10 |
| `docs/senda-4.0/audits/2026-11-23-repository-audit.md` | B10 |
| `docs/senda-4.0/context/project-context.md` | B02, B03, B04, B05, B06, B07, B08, B09, B10 |
| `docs/senda-4.0/pivot.md` | B02, B03, B04, B05, B06, B07, B08, B09, B10 |
| `docs/senda-4.0/product/connect-concepts.md` | B02, B03, B04, B05, B06, B08, B10 |
| `docs/senda-4.0/product/connect-partner-sandbox.md` | B02, B04, B06, B08, B10 |
| `docs/senda-4.0/product/how-it-works.md` | B02, B03, B04, B05, B06, B07, B08, B09, B10 |
| `docs/senda-4.0/product/onboarding-dues-scenarios.md` | B06 |
| `docs/senda-4.0/product/pilot-runbook.md` | B06, B08, B10 |
| `docs/senda-4.0/product/scripts/pilot-loop.sh` | B06, B08, B10 |
| `docs/senda-4.0/research/bbps-india.md` | B02, B03, B04, B05, B06, B07, B08, B10 |
| `docs/senda-4.0/research/cousin-path-metrics.md` | B02, B03, B04, B05, B06, B07, B08, B10 |
| `docs/senda-4.0/research/demand-mto-diaspora.md` | B02, B03, B04, B05, B06, B07, B08, B09, B10 |
| `docs/senda-4.0/research/kuva-cash-feedback.md` | B09 |
| `docs/senda-4.0/research/lock-brief.md` | B02, B03, B04, B05, B06, B07, B08, B09, B10 |
| `docs/senda-4.0/research/rails-and-stack.md` | B02, B03, B04, B05, B06, B07, B08, B09, B10 |
| `docs/senda-4.0/research/research-plan.md` | B02, B03, B04, B05, B06, B07, B08, B09, B10 |
| `docs/senda-4.0/research/school-received-confirmation.md` | B02, B03, B04, B05, B06, B07, B08, B09, B10 |
| `docs/senda-4.0/research/supply-zw-schools.md` | B02, B03, B04, B05, B06, B07, B08, B09, B10 |
| `docs/senda-4.0/research/wedge-comparison.md` | B02, B03, B04, B05, B06, B07, B08, B09, B10 |
| `docs/senda-4.0/testing/README.md` | B02, B03, B04, B05, B06, B07, B08, B09, B10 |
| `docs/senda-4.0/testing/agents/README.md` | B02, B03, B04, B05, B06, B07, B08, B09, B10 |
| `docs/senda-4.0/testing/agents/briefs/agent-corridor-wedge.md` | B02, B03, B04, B05, B06, B07, B08, B09, B10 |
| `docs/senda-4.0/testing/agents/briefs/agent-docs-path.md` | B02, B03, B04, B05, B06, B07, B08, B09, B10 |
| `docs/senda-4.0/testing/agents/briefs/agent-dogfood.md` | B02, B03, B04, B05, B06, B07, B08, B09, B10 |
| `docs/senda-4.0/testing/agents/briefs/agent-freshness-scope.md` | B02, B03, B04, B05, B06, B07, B08, B09, B10 |
| `docs/senda-4.0/testing/agents/briefs/agent-full-matrix.md` | B02, B03, B04, B05, B06, B07, B08, B09, B10 |
| `docs/senda-4.0/testing/agents/briefs/agent-links-confirm.md` | B02, B03, B04, B05, B06, B07, B08, B09, B10 |
| `docs/senda-4.0/testing/agents/briefs/agent-pricing-outreach.md` | B02, B03, B04, B05, B06, B07, B08, B09, B10 |
| `docs/senda-4.0/testing/agents/briefs/agent-recon-disputes.md` | B02, B03, B04, B05, B06, B07, B08, B09, B10 |
| `docs/senda-4.0/testing/agents/briefs/agent-settle-connect.md` | B02, B03, B04, B05, B06, B07, B08, B09, B10 |
| `docs/senda-4.0/testing/agents/briefs/agent-stack.md` | B02, B03, B04, B05, B06, B07, B08, B09, B10 |
| `docs/senda-4.0/testing/cases/all-cases.yaml` | B02, B03, B04, B05, B06, B07, B08, B09, B10 |
| `docs/senda-4.0/testing/cases/schema.yaml` | B02, B03, B04, B05, B06, B07, B08, B09, B10 |
| `docs/senda-4.0/testing/coverage-map.md` | B02, B03, B04, B05, B06, B07, B08, B09, B10 |
| `docs/senda-4.0/testing/fixtures/pilot-zw.yaml` | B02, B03, B04, B05, B06, B07, B08, B09, B10 |
| `docs/senda-4.0/testing/scenario-catalog.md` | B02, B03, B04, B05, B06, B07, B08, B09, B10 |
| `docs/senda-4.0/testing/scripts/validate_pack.py` | B02, B03, B04, B05, B06, B07, B08, B09, B10 |
| `docs/senda-4.0/work-plan.md` | B02, B03, B04, B05, B06, B07, B08, B09, B10 |
| `senda/docs/bbps-india.md` | B02, B03, B04, B05, B06, B07, B08, B10 |
| `senda/docs/senda-4.0-pivot.md` | B01, B02, B03, B04, B05, B06, B07, B08, B09, B10 |
