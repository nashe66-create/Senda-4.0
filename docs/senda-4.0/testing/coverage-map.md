# Coverage map — locks → scenarios

Generated against [cases/all-cases.yaml](cases/all-cases.yaml) and [scenario-catalog.md](scenario-catalog.md).  
Re-check anytime with:

```bash
python3 docs/senda-4.0/testing/scripts/validate_pack.py --coverage
```

## Summary

| Lock / theme | Case IDs | Count | Status |
| --- | --- | --- | --- |
| #1 Dogfood UI | DF-01..DF-05 | 5 | Covered |
| #2 Links + confirm verify | LK-01..LK-10 | 10 | Covered |
| #3 Pricing deferred | PR-01..PR-03 | 3 | Covered |
| #4 Outreach parallel | DP-01..DP-03 | 3 | Covered |
| #5 ZW-only live + enums | CR-01..CR-03, CR-05, PC-03, FR-08, OP-01 | 7+ | Covered |
| #6–#8 Docs path | DOC-01..DOC-04 | 4 | Covered |
| #9 Stack constraints | ST-01..ST-09 | 9 | Covered |
| #10 Settle + Connect path | SD-01..SD-13, DF-01, LK-03, FR-05, FR-07, PC-*, RC-01, RC-05, RC-08, AB-*, OP-* | 13+ core | Covered |
| Wedge UK→ZW school fees | CR-04..CR-06, CR-01, SD-13 | 5+ | Covered |
| Freshness templates/fetch/CSV | FR-01..FR-09, ST-06, LP-02..03, OP-03..04 | 9+ | Covered |
| Scope local payers deferred | LP-01..LP-03, SD-07 | 4 | Covered |
| Disputes / recon | RC-01..RC-14, LK-07..09, AB-02..03 | 14+ | Covered |

**Total structured cases:** **95** (see validator output for exact count).

## Domain-object coverage

| Domain object | Primary cases | Gaps |
| --- | --- | --- |
| Link | LK-01..10, AB-01 | None for lock #2 |
| Obligation | FR-*, LK-04, CR-05..06, LP-02, OP-04 | Partial-pay *rules* beyond exact-match MVP not productized — noted as later |
| Attempt / Instruction | DF-01..02, SD-08..12, RC-05, RC-11..12, AB-02..03 | Cancel/expiry SLA timings not numeric yet (ops TBD) |
| Confirmation | LK-03, LK-06..09, RC-01..10, RC-06..07, AB-05 | Webhook delivery retries not specified (later M4) |
| Proof | DF-01, RC-13..14, ST-04 | PDF proofs later — JSON only asserted |
| SettleDestination | SD-01..13, PC-01..03, AB-04, OP-02, OP-05 | InnBucks/OneMoney enums later — out of pilot |
| Institution | CR-*, OP-01, FR-08 | Named 5–10 real schools = outreach, not case gap |
| Surface (Dogfood/Biller/Connect) | DF-*, ST-02..03, ST-08, DP-02 | Live UI tests blocked until scaffold |
| Partner | PC-01..06, SD-10, ST-02 | Live partner API contracts pending outreach |

## Explicit gaps (called out, not blockers)

1. **No executable Connect HTTP harness yet** — cases are agent/docs runnable; wire to `/v1` when M4 lands.
2. **Numeric settle-window / cancel SLA** for RC-05 not locked — case asserts “not auto-proven” only.
3. **Partial-pay policy** beyond exact-match MVP (RC-10) — BBPS-style rules later.
4. **PDF proof** — out of 90-day must; ST-04/RC-13 assert JSON + object store.
5. **Webhook retry/storm** — later; not in pack.
6. **Real partner sandbox credentials** — fixtures use sandbox hints; DP/PC cases stay capability-level.
7. **ZiG path** (CR-06) — edge flagged; only if a named pilot forces it.

## Pass bar for this pack PR

- Every lock #1–#10 + wedge/freshness/scope/disputes appears in ≥1 case.
- Validator exits 0.
- Agent briefs exist for each lock group under [agents/briefs/](agents/briefs/).
