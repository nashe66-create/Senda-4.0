# Senda 4.0 security findings

**Baseline:** `4bf9ed5dbe46e454baaa176f0c62df634230e173`  
**Review date:** 23 November 2026  
**Evidence:** static source/config review plus manual checks against a disposable PostgreSQL 16 container bound only to `127.0.0.1`; test credentials and fixture data only. No live production database, partner, secret or personal record was used. Exact runtime evidence is in [runtime-and-test-results.md](runtime-and-test-results.md).

Severity is deployment-aware: **High (P1)** means a release blocker before real tenant/partner/payment use; **Medium (P2)** means a material control gap to close before production; **Low (P3)** means hardening. Findings are confirmed in the code unless explicitly marked “conditional” or “not established.” No exploit against an external system was performed.

## Confirmed findings

### SF-01 — Biller session claims are unsigned and forgeable

- **Severity:** High (P1)
- **Status:** Confirmed in code and reproduced locally.
- **Evidence:** `apps/web/src/lib/auth.ts:65-96` parses a Base64URL JSON cookie and trusts the user/institution/email fields without a MAC, signature, server-side session lookup, expiry or revocation. Login sets that value with HttpOnly/Lax and a one-week Max-Age but no integrity mechanism or explicit `Secure` (`apps/web/src/app/api/v1/biller/login/route.ts:20-47`). The example `BILLER_SESSION_SECRET` at `apps/web/.env.example:8` is not referenced by application code. `apps/web/src/app/biller/page.tsx:19-28` and `apps/web/src/app/api/v1/biller/proofs/[attemptId]/route.ts:17-33` rely on the claims for tenant scoping.
- **Reproduction:** In the local seeded fixture only, a cookie made from attacker-chosen JSON claims returned HTTP 200 for `/biller` and the proof-download route. No external data was accessed.
- **Impact:** An attacker who knows or obtains an institution's internal ID can forge a session and read that institution's dashboard/proofs; HttpOnly does not stop a client from constructing a cookie. The claimed tenant boundary is not an authentication boundary.
- **Fix:** Replace the cookie with a signed, expiring session or opaque server-side session ID; verify signature/expiry on every request; bind the session to a database user and institution; implement password hashing and session revocation; set Secure, HttpOnly, SameSite and appropriate rotation/CSRF controls.
- **Acceptance criteria:** Altering any cookie claim or signature is rejected; unknown/disabled users, expired/revoked sessions and cross-institution IDs cannot read Biller data or proof; login passwords are stored as slow salted hashes; production cookie has Secure; automated tests cover valid and tampered/cross-tenant cookies.

### SF-02 — New retry keys can create multiple active attempts for one obligation

- **Severity:** High (P1)
- **Status:** Confirmed in code and reproduced locally.
- **Evidence:** `apps/web/src/lib/connect.ts:192-195` accepts `instructed` obligations. `instructPayment` creates a new attempt whenever the supplied retry key is new (`connect.ts:397-454`); schema `apps/web/prisma/schema.prisma:217,236-248` has no one-active-attempt constraint on an obligation.
- **Reproduction:** On a fresh fixture bill, two sequential `POST /api/v1/connect/instruct` requests with the same link, obligation and amount but distinct retry keys both returned HTTP 200 and distinct `attempt_id` values.
- **Impact:** A partner can receive two sets of valid pay instructions for one amount due and potentially settle twice. Concurrent requests make this worse; database serialization around each individual request does not protect the obligation across different retry keys.
- **Fix:** Define a single active-attempt state policy and enforce it atomically, e.g. lock/conditional state transition on the obligation and reject a new key while an in-flight attempt exists. Only the same partner-scoped key should replay the existing instruction. Define how canceled/expired/reconciled attempts permit a new one.
- **Acceptance criteria:** Sequential and concurrent requests for one obligation cannot create more than one eligible active attempt; same-key retries return the exact original attempt; distinct-key requests while one is active return a stable conflict; a concurrency test asserts the invariant in PostgreSQL.

### SF-03 — Retry-key replay is global and not bound to the calling partner

- **Severity:** High (P1)
- **Status:** Confirmed in code and reproduced locally.
- **Evidence:** `loadAttemptByRetryKey` finds by `idempotencyKey` only (`apps/web/src/lib/connect.ts:372-400`). `replayOrConflictRetryKey` compares link, obligation and amount but not partner (`connect.ts:328-369`). `Attempt.idempotencyKey` is globally unique (`apps/web/prisma/schema.prisma:236`; migration index `apps/web/prisma/migrations/20261119092035_init_domain/migration.sql:256`).
- **Reproduction:** In the isolated fixture, one seeded partner instructed a payment and a second partner with a distinct key submitted the same retry key/link/obligation/amount. Both requests returned HTTP 200 with the same attempt ID and customer reference.
- **Impact:** A different partner can obtain another partner's payment reference and frozen payout instructions and can interfere with idempotent request handling. Confirmation ownership is checked separately, but that does not make disclosing/replaying the instruction safe.
- **Fix:** Scope idempotency to partner in the database uniqueness constraint and lookup; explicitly verify ownership before replay; ensure conflict responses disclose no attempt/reference/destination data.
- **Acceptance criteria:** Cross-partner reuse returns 404/409 without payment details; the same partner gets a deterministic same-payload replay; schema migration and API/integration tests cover partner A/B and concurrent requests.

### SF-04 — Pilot page exposes the configured partner API key to browsers

- **Severity:** High (P1) if the configured key has authority beyond an isolated demo; the default seeded value is fixture-only.
- **Status:** Confirmed in code and reproduced locally.
- **Evidence:** `apps/web/src/app/pilot/page.tsx:6-12,100` loads the configured key or a hard-coded demo fallback and passes the full value to `PilotClient`. `apps/web/src/app/pilot/pilot-client.tsx:79,101` stores it in client state and sends it as a Bearer token. The seeded key fallback is in `apps/web/prisma/seed.ts:34-41`.
- **Reproduction:** The local `/pilot` response contained the configured throwaway audit key. The value is omitted here; no production credential was used or published.
- **Impact:** Any visitor can extract a key and call Connect as that partner. If an operator configures a real/reusable partner credential here, it is disclosed; key access may allow payment instruction and confirmation operations.
- **Fix:** Never pass server-held partner credentials to a client. Use a server-only, explicitly demo-scoped proxy with strict authorization and production disablement, or require the partner to supply its own sandbox credential without server defaults. Rotate any exposed real key.
- **Acceptance criteria:** HTML/RSC/client bundles and browser network state contain no server credential; a production-mode request cannot use demo credentials; demo capabilities are separately scoped and tested.

### SF-05 — Public dogfood route performs writes and synthetic proof issuance

- **Severity:** High (P1) outside a non-production isolated demo.
- **Status:** Confirmed in code and reproduced locally.
- **Evidence:** `apps/web/src/app/api/v1/dogfood/run/route.ts:28-83` accepts unauthenticated POSTs, directly loads the seeded partner, creates an instruction and calls `confirmPayment` with `source: "dogfood_stub"`. No environment-mode or authorization guard is visible.
- **Reproduction:** An unauthenticated POST against the disposable fixture returned HTTP 200 and `proof_issued: true`; only synthetic fixture data was mutated.
- **Impact:** If deployed with live or shared data, an unauthenticated caller can alter obligation/payment state, create fabricated “proven” records and proof artifacts, and consume database/storage resources.
- **Fix:** Remove the route from production builds or reject unless an explicit non-production flag and demo-only database/credential scope are both active; add authentication and rate/size limits even for shared demos.
- **Acceptance criteria:** Production/staging configuration rejects the route before any DB read/write; no public request can create confirmation/proof; integration tests assert the guard and no side effects.

### SF-06 — Public pilot handoff is an attempt-ID disclosure endpoint

- **Severity:** High (P1) when real institution/student data is present; Medium (P2) for the current seeded-only use.
- **Status:** Confirmed in code and reproduced locally.
- **Evidence:** `apps/web/src/app/api/v1/pilot/handoff/route.ts:11-31` accepts a caller-selected `attempt_id` and queries it without partner or Biller authorization. The response includes institution, beneficiary/student reference, bill, payment reference, partner, reconciliation and proof metadata (`route.ts:40-97`).
- **Reproduction:** An unauthenticated local GET for a fixture attempt returned HTTP 200 and the organisation, beneficiary, payment-reference and proof-metadata sections. Values are not reproduced here.
- **Impact:** Guessing, obtaining or otherwise learning an attempt ID exposes student-linked payment data and can disclose proof status. IDs are identifiers, not access controls.
- **Fix:** Remove the production route or require authorization scoped to the owning partner or institution; return only fields needed by that role; avoid exposing student references in public handoffs; rate-limit and audit access.
- **Acceptance criteria:** Anonymous calls return 401/404 without record-specific differences; authenticated partner/biller access is scoped to its own records; response minimization and IDOR tests cover cross-tenant IDs.

### SF-07 — Matching partner attestation is promoted to “proven” payment proof

- **Severity:** High (P1) before real settlement/customer claims.
- **Status:** Confirmed product/evidence semantics; the code and UI label are explicit.
- **Evidence:** `apps/web/src/lib/connect.ts:526-527,632-743` considers only the partner-submitted reference, amount and currency match, sets status to `proven`, and creates `senda.proof.v1`; source is still partner-supplied (`connect.ts:668,724`). `apps/web/src/lib/ui-labels.ts:8-13` presents `proven` as “Confirmed.” The pilot note explicitly says this is not a bank-credit feed (`apps/web/src/app/api/v1/pilot/handoff/route.ts:96-98`).
- **Impact:** A recipient, school, auditor or partner may interpret the status/proof as independent evidence of money credited or allocated when it is only a matching partner assertion. This can create false financial records and disputes.
- **Fix:** Separate partner-confirmed, credited and biller-allocated states/evidence. Label current evidence “partner confirmation matched”; include issuer, evidence method, verification level and timestamps; do not make a receipt/credit claim without independent evidence.
- **Acceptance criteria:** A matching partner callback alone cannot be represented as credited/allocated; rendered UI, API and proof schema state the attestation source; independent evidence paths and disagreement/correction tests are defined.

### SF-08 — Seed script deletes all domain records without an environment safety check

- **Severity:** High (P1) operational data-loss risk if invoked against a shared or production database.
- **Status:** Confirmed in code; not run against anything except the disposable audit database.
- **Evidence:** `apps/web/prisma/seed.ts:20-31` issues `deleteMany()` against every domain model before recreating the demo records. `apps/web/package.json` exposes this through `db:seed` and Prisma seed configuration.
- **Impact:** An operator who points `DATABASE_URL` at a non-fixture database and runs the documented seed can erase partner, institution, obligation, attempt, confirmation and proof data.
- **Fix:** Fail closed on production and non-fixture environments; require an explicit destructive flag; separate fixture creation from cleanup; use a test-only DB role/schema.
- **Acceptance criteria:** Production seed invocation exits before the first database write; CI verifies the guard; a fixture reset can only target a named disposable database.

### SF-09 — Proof storage is local filesystem I/O inside a DB transaction

- **Severity:** Medium (P2)
- **Status:** Confirmed.
- **Evidence:** `apps/web/src/lib/proofs.ts:9-21` writes `proof_<attempt>.json` under a local directory. `apps/web/src/lib/connect.ts:659-740` calls it before `tx.proof.create` and transaction commit.
- **Impact:** Container replacement or multiple app instances can lose/unshare proof files; a later DB failure can leave an orphaned file; there is no demonstrated retry, integrity or retention policy.
- **Fix:** Use durable object storage with access controls and integrity checks; move upload to a post-commit/outbox workflow with retries and idempotent reconciliation; keep DB metadata authoritative.
- **Acceptance criteria:** Simulated storage/DB failures leave no inconsistent “proof issued” state or unrecoverable orphan; proof fetch succeeds across app instances and after restart.

### SF-10 — Local Compose database has known credentials and a non-loopback published port

- **Severity:** Medium (P2) if the host is reachable from untrusted networks.
- **Status:** Confirmed configuration; exposure depends on the host/firewall.
- **Evidence:** Root `docker-compose.yml:4-17` uses fixed development username/password and publishes `5432:5432` without binding the host side to `127.0.0.1`.
- **Impact:** Running the development stack on a network-reachable machine may expose its database to remote clients using known credentials. The named volume also persists local state across runs.
- **Fix:** Bind the development port to loopback by default, use per-developer local credentials, and explicitly label the Compose file development-only. Do not reuse these credentials in production.
- **Acceptance criteria:** `docker compose config` shows loopback-only binding; deployment config uses managed secrets/network restrictions; no production database uses the fixture credentials.

## Conditional / unverified controls

### SF-11 — No application-level rate limits found

- **Severity:** Medium (P2), conditional on no edge/platform control.
- **Status:** No rate limiter or auth throttling appears in the 44 tracked app files; an external gateway might provide controls and was not in scope.
- **Evidence:** Partner checks are per-request DB lookups (`src/lib/auth.ts:20-60`); the login and public demo routes have no app throttle. No app middleware is tracked.
- **Impact:** Credential guessing, key probing and unbounded attempt/proof creation could consume resources or magnify abuse.
- **Fix:** Configure per-IP and per-principal limits at an edge and app level; bound request sizes and high-cost writes; alert on auth failure and write anomalies.
- **Acceptance criteria:** Limits are documented, testable and effective behind the actual proxy; throttled requests do not create state and produce safe retry guidance.

### SF-12 — Confirmation timestamp and lifecycle validation are incomplete

- **Severity:** Low/Medium (P2)
- **Status:** Confirmed validation gap; no live exploit or corrupt record was attempted.
- **Evidence:** `apps/web/src/app/api/v1/connect/confirm/route.ts:32-40` accepts any string for `settled_at`; `apps/web/src/lib/connect.ts:539-574,655-657` constructs a Date without checking validity and performs no explicit first-confirmation status-transition check before recording it.
- **Impact:** Malformed dates can become internal/database errors; future state transitions could accept a confirmation for a disallowed/canceled attempt unless separately protected.
- **Fix:** Validate ISO timestamps and permitted time ranges at the route boundary; encode allowed transition guards in the transaction and reject invalid attempt states.
- **Acceptance criteria:** Invalid dates return a stable 400; valid date normalization is tested; canceled/non-instructed attempts cannot become proven; transition tests cover retries and concurrency.

### SF-13 — Production dependency advisories

- **Severity:** Medium (P2)
- **Status:** Confirmed by npm advisory data on 23 November 2026.
- **Evidence:** `npm audit --omit=dev --audit-level=low` reported 6 vulnerabilities: 1 moderate and 5 high. The affected paths include `deepmerge-ts`, `effect` through Prisma tooling/dependencies, and `postcss` through Next.js.
- **Impact:** Depending on the reachable code paths, the findings may permit stack exhaustion or unsafe source-map/stylesheet processing. This audit did not establish exploitability in the application and did not run the applications' advisory endpoints.
- **Fix:** Upgrade Prisma and Next.js/PostCSS through a coordinated, tested dependency update. Do not use `npm audit fix --force` without review because it proposes breaking major upgrades. Re-run build, migration, lint, typecheck and API tests after each compatible upgrade.
- **Acceptance criteria:** `npm audit --omit=dev` reports no unresolved relevant high/critical production advisories, or documented exceptions identify package reachability and compensating controls; the compatible dependency version set remains buildable and tested.

## Audit limits

No dependency advisory scan, external penetration test, platform/proxy configuration review, production credential review, legal opinion or real-rail integration test was performed. The exact HEAD was reviewed and no application source, schema, migration, branch or PR was modified. Do not interpret absence of a code-level control as evidence that an unreviewed deployment gateway has no such control.
