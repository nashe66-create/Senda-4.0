# Senda 4.0 — lock scenario test pack

Practical, re-runnable **docs + fixtures + agent briefs** that exercise every locked Senda 4.0 decision against case studies. No product app is required to run the pack today; when Connect/Biller/dogfood exist, the same cases become executable acceptance tests.

**Does not reopen locks.** Assertions encode expected behavior from preferences + `docs/senda-4.0/`.

## What’s here

| Path | Purpose |
| --- | --- |
| [scenario-catalog.md](scenario-catalog.md) | Exhaustive scenario matrix (happy / edge / abuse / ops / partner / recon) |
| [coverage-map.md](coverage-map.md) | Lock → scenario coverage; gaps called out |
| [cases/](cases/) | Structured YAML cases (`id`, locks, steps, expect) |
| [agents/](agents/) | Test-agent briefs + how to run them |
| [fixtures/](fixtures/) | Shared organisation / pay code / amount due / partner fixtures (system: Institution / Link / Obligation) |
| [scripts/validate_pack.py](scripts/validate_pack.py) | Lint cases, print coverage, dry-run agent briefs |

## Locks under test

| Lock | Short |
| --- | --- |
| #1 | Dogfood UI = yes, minimal |
| #2 | Links = open student+school; verify on confirm |
| #3 | Pricing deferred (instrument usage only) |
| #4 | Design-partner outreach parallel; none named |
| #5 | Live pilot ZW only; other corridors enums-only |
| #6–#8 | Docs on main; pack ported; path `docs/senda-4.0/` |
| #9 | Next.js App Router + TypeScript + Postgres; partner API keys + school/ops auth; S3 proofs; no NN/ERP/PSP-core day one |
| #10 | `bank_usd` + school-owned `ecocash`; reject cash/relative; Paynow/ZIPIT local-only; validate→ref→confirm→proof |
| Wedge | UK → ZW private school fees first (other billers later) |
| Freshness | Fee templates → bulk amounts due; fetch-at-pay; CSV onboarding only |
| Scope | Abroad UK→ZW first; local payers deferred |
| Disputes | Partner fails-to-deliver / false-confirm / organisation unpaid → needs a check (`needs_reconcile`) |

## How to run

From repo root:

```bash
# Lint all YAML cases + print lock coverage
python3 docs/senda-4.0/testing/scripts/validate_pack.py

# List scenarios for one lock
python3 docs/senda-4.0/testing/scripts/validate_pack.py --lock 10

# Emit the agent brief for one case (copy into a Cursor agent / eval)
python3 docs/senda-4.0/testing/scripts/validate_pack.py --case SD-09 --emit-brief

# Run all agent briefs in dry-run mode (prints pass criteria; no live API)
python3 docs/senda-4.0/testing/scripts/validate_pack.py --dry-run-agents
```

### Re-running with a live agent

1. Pick a case id from [cases/all-cases.yaml](cases/all-cases.yaml) or the catalog.
2. Open the matching brief under [agents/briefs/](agents/briefs/) (or `--emit-brief`).
3. Give the agent the brief + fixtures + “assert expect.* verbatim; do not reopen locks.”
4. Record outcome in the Project tracker or a CI note: `pass` | `fail` | `blocked (no harness yet)`.

When Connect sandbox exists, map each case’s `steps` to HTTP calls (`validate` → `instructions` → `confirm`) and assert `expect.status` / `expect.error_code`.

## Counts

Run `validate_pack.py` for the live count. The catalog targets **70+** scenarios across domain objects: Link (pay code), Obligation (amount due), Attempt (payment), Instruction, Confirmation, Proof, SettleDestination (payout account), plus surface locks (Dogfood, Docs, Stack, Pricing, Outreach, Corridor).

## Related product docs

- [Connect concepts — wording map](../product/connect-concepts.md)
- [How it works](../product/how-it-works.md)
- [Lock brief](../research/lock-brief.md)
- [Rails & stack](../research/rails-and-stack.md)
- [Work plan](../work-plan.md)
