# Test agents — how to run

These agents **exercise locked decisions**. They do not redesign product. Prefer fail over inventing behavior.

## Quick start

```bash
# From repo root — lint + coverage
python3 docs/senda-4.0/testing/scripts/validate_pack.py

# Dry-run every agent brief (prints case ids + pass criteria)
python3 docs/senda-4.0/testing/scripts/validate_pack.py --dry-run-agents

# Emit a single-case brief into the terminal
python3 docs/senda-4.0/testing/scripts/validate_pack.py --case SD-09 --emit-brief
```

## Agent set

| Agent brief | Locks | Cases |
| --- | --- | --- |
| [briefs/agent-dogfood.md](briefs/agent-dogfood.md) | #1, #4 | DF-* |
| [briefs/agent-links-confirm.md](briefs/agent-links-confirm.md) | #2 | LK-* |
| [briefs/agent-pricing-outreach.md](briefs/agent-pricing-outreach.md) | #3, #4 | PR-*, DP-* |
| [briefs/agent-corridor-wedge.md](briefs/agent-corridor-wedge.md) | #5, wedge | CR-* |
| [briefs/agent-docs-path.md](briefs/agent-docs-path.md) | #6–#8 | DOC-* |
| [briefs/agent-stack.md](briefs/agent-stack.md) | #9 | ST-* |
| [briefs/agent-settle-connect.md](briefs/agent-settle-connect.md) | #10 | SD-*, PC-* |
| [briefs/agent-freshness-scope.md](briefs/agent-freshness-scope.md) | freshness, scope | FR-*, LP-* |
| [briefs/agent-recon-disputes.md](briefs/agent-recon-disputes.md) | disputes | RC-*, AB-*, OP-* |
| [briefs/agent-full-matrix.md](briefs/agent-full-matrix.md) | all | all cases |

## Operating rules (every agent)

1. Read [../fixtures/pilot-zw.yaml](../fixtures/pilot-zw.yaml) and the case(s) in [../cases/all-cases.yaml](../cases/all-cases.yaml).
2. Assert `expect` and `pass_criteria` **verbatim**. Do not soften rejects into allows.
3. **Do not reopen** locks #1–#10, wedge, freshness, or scope.
4. If the product/API does not exist yet, mark the case `blocked_no_harness` and still verify **docs/lock compliance** (does the locked text forbid the bad path?).
5. Record results as a table: `case_id | result | evidence`.

## When Connect exists

Map steps to:

- `POST /v1/validate`
- `POST /v1/instructions`
- `POST /v1/confirmations`
- `GET /v1/attempts/:id/proof`

Use partner API key from sandbox; never commit real secrets.
