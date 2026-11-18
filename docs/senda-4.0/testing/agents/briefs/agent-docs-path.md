# Test agent — Docs path (Locks #6–#8)

## Mission

Canonical documentation lives under `docs/senda-4.0/`. This test pack must live there too.

## Cases

DOC-01 .. DOC-04

## Procedure

1. Assert pack files exist on the branch/main: how-it-works, lock-brief, work-plan, README.
2. Assert legacy stubs (if present) point into the pack.
3. Reject proposals to relocate the pack root.
4. Assert `docs/senda-4.0/testing/` exists.

## Pass / fail

Runnable as filesystem checks via `validate_pack.py` (docs cases). Hard fail if pack missing or path lock violated.
