# Test agent — Links + confirm verification (Lock #2)

## Mission

Exercise open student+school Links and **verification on confirm** (ref + amount + currency).

## Cases

LK-01 .. LK-10

## Procedure

1. Validate with open `link_code` (no payer binding) → allow.
2. Two payers same Link → allow.
3. Happy confirm exact match → `proven`.
4. Wrong obligation / unknown link / confirm-without-instruct → `reject`.
5. Wrong amount / currency / ref → `needs_reconcile`.
6. Policy: payer-bound Links not required day one.

## Pass / fail

All LK cases match `expect.status`. Hard fail if Links are payer-bound by default or confirm skips verification.
