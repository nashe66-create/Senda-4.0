# Database and Data Integrity Audit

**Baseline:** `4bf9ed5dbe46e454baaa176f0c62df634230e173`  
**Scope:** `apps/web/prisma/schema.prisma`, the sole migration, seed and all transaction code.

## Migration/runtime verification

Commands used:

```sh
cd apps/web
DATABASE_URL='postgresql://audit:audit@127.0.0.1:55440/audit?schema=public' npx prisma migrate deploy
DATABASE_URL='postgresql://audit:audit@127.0.0.1:55440/audit?schema=public' ... npm run db:seed
```

Migration `20261119092035_init_domain` applied successfully to a disposable PostgreSQL 16 container. The container was loopback-bound and removed after recheck.

## Schema inventory

The model has Partner, Institution, SchoolUser, SettleDestination, Beneficiary, Link, FeeTemplate, Obligation, Attempt, Instruction, Confirmation and Proof. It is sufficient for a fixture but incomplete for a reconciled payment ledger.

## Constraints and keys

| Area | Present | Gap |
|---|---|---|
| Primary keys | CUID text IDs on all entities | Internal IDs are usable identifiers but not authorization tokens. |
| External uniqueness | Institution, destination, beneficiary, link, obligation references | External IDs are enforced per table, not tenant-verified in domain queries everywhere. |
| Beneficiary uniqueness | `(institutionId, studentRef)` | No entity history or merge/correction model. |
| Link uniqueness | global `linkCode` | Link belongs to institution and beneficiary and has no destination binding. |
| Decimal | `Decimal(12,2)` for fee, obligation, attempt, instruction and confirmation | Precision is adequate for cents but there is no DB currency constraint and no nonnegative check. |
| Currency | free `String` | No enum or allowed ISO-currency constraint; destination, fee, obligation, attempt and confirmation can disagree by data. |
| Retry key | global `@unique` | Missing `(partnerId,idempotencyKey)` and partner nonnull policy. |
| One instruction | unique `attemptId` | Exactly one instruction per attempt, but multiple attempts are allowed per obligation. |
| One confirmation/proof | unique `attemptId` | This prevents repeats but does not record evidence history/revisions. |
| Active attempt | none | No partial unique constraint or transaction lock/serial state invariant. |
| Obligation history | none | No version, override, source, effective period or supersession records. |
| Destination history | only updated row | No change approval, snapshot/effective-period or verification evidence. |
| Allocation | none | No separate biller-credited/allocated state or evidence model. |

Exact key/constraint evidence: `apps/web/prisma/schema.prisma:82-280`; migration `apps/web/prisma/migrations/20261119092035_init_domain/migration.sql:216-271`.

## Foreign keys and cascades

All principal payment/operation foreign keys use `RESTRICT`; `Partner -> Attempt` and `FeeTemplate -> Obligation` use `SET NULL` for delete. Institution, beneficiary, destination and attempt removal are intentionally restricted in the migration.

The migration is consistent on delete behavior, but no seed/maintenance process should be allowed to delete live domain data.

Foreign-key evidence: migration lines 273-319.

## Transactions

### Instruction

`instructPayment` uses `prisma.$transaction`, creates Attempt and Instruction and updates the obligation. It does not:

- lock the obligation or active attempt set;
- ensure only `open` obligations;
- enforce partner-scoped idempotency;
- ensure an attempt is partner-owned before replay.

The result: distinct keys created duplicate active attempts; the recheck returned IDs `cmwt692e000018jij72pf9bke` and `cmwt692g400058jij2o0ldyz` for the same bill.

### Confirmation

The confirmation transaction writes Confirmation, updates Attempt/Obligation and creates Proof. Proof filesystem I/O happens before the transaction at `apps/web/src/lib/connect.ts:659-740`, leaving consistency and orphan risks.

No DB check constrains allowed transitions. Prisma enum values provide a limited type guard, not a state machine.

## Nullability and domain consistency

- `Attempt.partnerId` is nullable even though instruct routes require an authenticated partner. A partner deletion sets null. Partner ownership and traceability should be required for instructed attempts.
- `FeeTemplate` on Obligation is nullable; due source can be inferred but is not independently versioned.
- Destination fields are polymorphic with nullable fields. DB constraints do not enforce bank title/number, EcoCash ownership/MSISDN or merchant details.
- `payerHint` is free text and not evidence.
- Confirmation `settledAt` is required, but request input is optional and route/Zod do not validate ISO-8601.
- Proof `payload` and `storageKey` are not integrity/hashes or durable-object metadata.

## Seed integrity

`apps/web/prisma/seed.ts:20-31` deletes every domain table in sequence. It runs with no production guard and is exposed as `db:seed` and Prisma seed. `db:reset` is additionally destructive.

Status: **CONFIRMED**. It was not run against a non-disposable database.

## Destination changes

The implementation freezes the selected destination snapshot in `Instruction.frozenDestination`, which is useful. It does not preserve a destination-change approval/history, verification evidence or effective timestamp. A destination change may update the live row while old instructions retain old snapshots.

Acceptance:

- versioned obligation and destination records;
- explicit `obligation_version_id` and `destination_version_id` on attempts/instructions;
- immutable frozen JSON plus source/evidence identifiers;
- DB constraints for partner scope and active attempt uniqueness;
- no nullable partner on newly instructed attempts;
- positive amount/currency checks;
- explicit allowed-state transitions.

## Verification status

Migration, constraints and source findings: **CONFIRMED**. Concurrency duplicate and cross-partner replay: **CONFIRMED** by PostgreSQL recheck.
