# Test agent — Freshness + local-payer scope

## Mission

Fee templates → bulk amounts due (Obligations); fetch-at-pay; CSV = onboarding only; local ZW payers deferred.

## Cases

FR-01 .. FR-09, LP-01 .. LP-03

## Procedure

1. Generate Obligations from grade/class templates (FR-01).
2. Fetch Obligation at validate/pay time (FR-02).
3. Reject daily CSV as ongoing process (FR-03).
4. Stale / missing Obligation → reject instruct (FR-04, FR-05, FR-09).
5. Biller exceptions OK; proven pays update ledger (FR-06, FR-07).
6. Unmaintained school off live Connect (FR-08).
7. Local payer product deferred; manual external mark optional (LP-*).

## Pass / fail

Hard fail if freshness depends on daily full-roster CSV, or if local-payer depth is required for MVP.
