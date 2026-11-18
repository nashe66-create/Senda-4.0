# Test agent — Dogfood UI (Lock #1)

## Mission

Walk dogfood scenarios DF-01..DF-05. Confirm a **minimal** dogfood surface can run validate→instruct→confirm→proof **without** a live MTO, without becoming `senda_settles`, and without a consumer remittance UI.

## Inputs

- Fixtures: `docs/senda-4.0/testing/fixtures/pilot-zw.yaml`
- Cases: DF-01, DF-02, DF-03, DF-04, DF-05 in `cases/all-cases.yaml`
- Spec: `docs/senda-4.0/product/how-it-works.md` (Surfaces → Dogfood)

## Procedure

1. For each DF case, execute `steps` against dogfood (or docs if UI absent).
2. DF-01 must reach `proven` with `live_mto_required: false`.
3. DF-03/DF-04 must **reject** FX/collect/payout and consumer remittance features.
4. DF-05 ties to lock #4: cold-start unblocked.

## Pass / fail

| Case | Pass |
| --- | --- |
| DF-01 | Full loop + proof JSON |
| DF-02 | Same domain schema as Connect |
| DF-03 | No forbidden consumer features |
| DF-04 | `senda_settles_forbidden` |
| DF-05 | Runs without named partner |

**Hard fail:** any path that makes Senda the payout engine via dogfood.
