# Test agent — Tech stack constraints (Lock #9)

## Mission

Enforce Next.js App Router + TypeScript + Postgres; partner API keys + school/ops auth; S3-compatible proofs; **no** NN / ERP / PSP-core day one; Biller beside school systems.

## Cases

ST-01 .. ST-09

## Procedure

1. Docs/architecture must state locked stack (ST-01).
2. Connect uses partner API keys; Biller uses school/ops auth (ST-02, ST-03).
3. Proofs in S3-compatible store (ST-04).
4. Reject NN, ERP day one, PSP-core, alternate default stacks (ST-05..ST-09).

## Pass / fail

Hard fail if scaffold/docs reopen #9 or introduce NN/ERP/PSP-core as day-one core.
