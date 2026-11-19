# Test agent — Settle destinations + Connect path (Lock #10)

## Mission

Pilot Connect destinations = `bank_usd` + school-owned `ecocash`. Reject cash, relative wallets, Paynow/ZIPIT as Connect destinations. Model = validate → unique payment reference + frozen payout → partner confirm → payment proof. Partner-capability aware.

## Cases

SD-01 .. SD-13, PC-01 .. PC-06

## Procedure

1. Accept verified `bank_usd` and school `ecocash`.
2. Reject cash_pickup, relative EcoCash, Paynow merchant, ZIPIT school-code for Connect.
3. Allow Paynow/ZIPIT as **documented school-local** rails only (SD-07).
4. Run happy paths SD-08 (bank) and SD-09 (ecocash) to `proven`.
5. Capability mismatch (PC-01, SD-10, PC-03) → reject with clear error.
6. Unverified destination → reject; freeze snapshot on instruct (SD-11, SD-12).
7. Dual recon / custom ref docs (PC-04, PC-05).

## Pass / fail

Hard fail if cash/relative/Paynow/ZIPIT become Connect destinations, or if instruct skips validate→ref→confirm.
