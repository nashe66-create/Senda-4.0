# Test agent — Full lock matrix

## Mission

Run **every** structured case in `docs/senda-4.0/testing/cases/all-cases.yaml` against locked decisions. Prefer the specialized agents; use this brief for a single sweep / CI-style dry run.

## Procedure

```bash
python3 docs/senda-4.0/testing/scripts/validate_pack.py --dry-run-agents
python3 docs/senda-4.0/testing/scripts/validate_pack.py --coverage
```

Then, for each case id:

1. Load fixture + case.
2. If API/UI harness exists: execute `steps` and assert `expect`.
3. Else: docs-compliance check — does locked product text require the expected allow/reject?
4. Append row to results table.

## Output format

```text
case_id | locks | result | evidence
DF-01   | 1,10  | pass   | dogfood proof JSON present / docs require thin dogfood
...
```

Results: `pass` | `fail` | `blocked_no_harness` | `docs_pass`.

## Pass bar

- Validator exit 0.
- Every lock #1–#10 + wedge/freshness/scope/disputes has ≥1 non-failing case.
- Zero cases that reopen a lock.
