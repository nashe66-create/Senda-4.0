# Test agent — Recon, disputes, abuse, ops

## Mission

Cover MTO fails-to-deliver, false-confirm, school unpaid dispute, wrong destination, idempotency, and KYB/ops gates. Outcomes: `proven` | `needs_reconcile` | `reject` | `stuck_instructed`.

## Cases

RC-01 .. RC-14, AB-01 .. AB-05, OP-01 .. OP-05, LK-07 .. LK-09

## Procedure

1. Happy exact match → `proven` + proof (RC-01, RC-13).
2. Amount/currency/ref mismatch / partial → `needs_reconcile` (RC-02..04, RC-10).
3. **MTO fails to deliver** (no confirm) → never auto-proven (RC-05).
4. **False confirm** then school unpaid → `needs_reconcile` (RC-06, RC-07).
5. Wrong destination → `needs_reconcile` (RC-08).
6. Idempotent confirm/instruct; key conflicts reject (RC-09, RC-11, RC-12).
7. Proof blocked while `needs_reconcile` (RC-14).
8. Abuse: stolen link, double-pay, destination tamper, personal EcoCash, cross-partner confirm (AB-*).
9. Ops: incomplete KYB, account title mismatch, CSV onboard, fee assign, re-verify destination (OP-*).

## Pass / fail

Hard fail if false-confirm can remain silently `proven` after school unpaid dispute, or if fails-to-deliver auto-proves.
