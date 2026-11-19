# Test agent — Pricing deferred + outreach parallel (Locks #3, #4)

## Mission

Confirm pricing is deferred (instrument usage only) and design-partner outreach does not gate build.

## Cases

PR-01, PR-02, PR-03, DP-01, DP-02, DP-03

## Procedure

1. Attempt Connect/Biller fee configuration → `deferred` / no billing.
2. Usage events may exist with `billing_enabled: false`.
3. Proceed M1–M3 / test loop without a named remittance partner → allow.
4. Outreach shortlist may exist; none required named.

## Pass / fail

Hard fail if MVP ships Connect fee billing or build is blocked on a named partner.
