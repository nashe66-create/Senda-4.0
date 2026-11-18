#!/usr/bin/env python3
"""Lint Senda 4.0 lock scenario pack, print coverage, emit agent briefs.

Usage (from repo root):
  python3 docs/senda-4.0/testing/scripts/validate_pack.py
  python3 docs/senda-4.0/testing/scripts/validate_pack.py --coverage
  python3 docs/senda-4.0/testing/scripts/validate_pack.py --lock 10
  python3 docs/senda-4.0/testing/scripts/validate_pack.py --case SD-09 --emit-brief
  python3 docs/senda-4.0/testing/scripts/validate_pack.py --dry-run-agents
  python3 docs/senda-4.0/testing/scripts/validate_pack.py --docs-check
"""

from __future__ import annotations

import argparse
import sys
from collections import defaultdict
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover
    print("PyYAML required: pip install pyyaml", file=sys.stderr)
    sys.exit(2)

ROOT = Path(__file__).resolve().parents[4]  # repo root (…/Senda-4.0)
PACK = Path(__file__).resolve().parents[1]  # testing/
CASES_DIR = PACK / "cases"
FIXTURES = PACK / "fixtures" / "pilot-zw.yaml"
SCHEMA = CASES_DIR / "schema.yaml"
BRIEFS = PACK / "agents" / "briefs"

REQUIRED = {"id", "title", "domain", "locks", "type", "fixtures", "steps", "expect", "pass_criteria"}

REQUIRED_LOCKS = {
    "1",
    "2",
    "3",
    "4",
    "5",
    "6-8",
    "9",
    "10",
    "wedge",
    "freshness",
    "scope",
    "disputes",
}

DOC_PATHS = [
    PACK / "README.md",
    PACK / "scenario-catalog.md",
    PACK / "coverage-map.md",
    CASES_DIR / "all-cases.yaml",
    FIXTURES,
    BRIEFS / "agent-full-matrix.md",
    ROOT / "docs" / "senda-4.0" / "product" / "how-it-works.md",
    ROOT / "docs" / "senda-4.0" / "research" / "lock-brief.md",
]

AGENT_CASE_PREFIXES = {
    "agent-dogfood.md": ("DF-",),
    "agent-links-confirm.md": ("LK-",),
    "agent-pricing-outreach.md": ("PR-", "DP-"),
    "agent-corridor-wedge.md": ("CR-",),
    "agent-docs-path.md": ("DOC-",),
    "agent-stack.md": ("ST-",),
    "agent-settle-connect.md": ("SD-", "PC-"),
    "agent-freshness-scope.md": ("FR-", "LP-"),
    "agent-recon-disputes.md": ("RC-", "AB-", "OP-"),
    "agent-full-matrix.md": (),  # all
}


def load_yaml(path: Path):
    with path.open(encoding="utf-8") as f:
        return yaml.safe_load(f)


def load_cases() -> list[dict]:
    cases: list[dict] = []
    for path in sorted(CASES_DIR.glob("*.yaml")):
        if path.name == "schema.yaml":
            continue
        data = load_yaml(path)
        if not data or "cases" not in data:
            continue
        for case in data["cases"]:
            case["_source"] = str(path.relative_to(PACK))
            cases.append(case)
    return cases


def validate_cases(cases: list[dict], schema: dict) -> list[str]:
    errors: list[str] = []
    seen: set[str] = set()
    domains = set(schema.get("enums", {}).get("domain", []))
    types = set(schema.get("enums", {}).get("type", []))
    lock_allowed = set(schema.get("locks_allowed", [])) | REQUIRED_LOCKS

    for case in cases:
        cid = case.get("id", "<missing>")
        missing = REQUIRED - set(case)
        if missing:
            errors.append(f"{cid}: missing fields {sorted(missing)}")
        if cid in seen:
            errors.append(f"{cid}: duplicate id")
        seen.add(cid)

        if domains and case.get("domain") not in domains:
            errors.append(f"{cid}: invalid domain {case.get('domain')!r}")
        if types and case.get("type") not in types:
            errors.append(f"{cid}: invalid type {case.get('type')!r}")

        locks = case.get("locks") or []
        if not isinstance(locks, list) or not locks:
            errors.append(f"{cid}: locks must be non-empty list")
        else:
            for lock in locks:
                if str(lock) not in lock_allowed:
                    errors.append(f"{cid}: unknown lock {lock!r}")

        expect = case.get("expect")
        if not isinstance(expect, dict) or "status" not in expect:
            errors.append(f"{cid}: expect.status required")

        steps = case.get("steps")
        if not isinstance(steps, list) or not steps:
            errors.append(f"{cid}: steps must be non-empty list")

        if not case.get("pass_criteria"):
            errors.append(f"{cid}: pass_criteria required")

    return errors


def coverage(cases: list[dict]) -> dict[str, list[str]]:
    by_lock: dict[str, list[str]] = defaultdict(list)
    for case in cases:
        for lock in case.get("locks") or []:
            by_lock[str(lock)].append(case["id"])
    return dict(by_lock)


def print_coverage(cases: list[dict]) -> int:
    by_lock = coverage(cases)
    print(f"Total cases: {len(cases)}")
    print("Lock coverage:")
    missing = []
    for lock in sorted(REQUIRED_LOCKS, key=lambda x: (x.isdigit() is False, x)):
        ids = by_lock.get(lock, [])
        flag = "OK" if ids else "GAP"
        if not ids:
            missing.append(lock)
        print(f"  [{flag}] {lock:12} {len(ids):3}  {', '.join(ids[:8])}{'…' if len(ids) > 8 else ''}")
    by_domain: dict[str, int] = defaultdict(int)
    by_type: dict[str, int] = defaultdict(int)
    for case in cases:
        by_domain[case.get("domain", "?")] += 1
        by_type[case.get("type", "?")] += 1
    print("\nBy domain:")
    for k, v in sorted(by_domain.items()):
        print(f"  {k:20} {v}")
    print("\nBy type:")
    for k, v in sorted(by_type.items()):
        print(f"  {k:20} {v}")
    return 1 if missing else 0


def filter_cases(cases: list[dict], lock: str | None, case_id: str | None) -> list[dict]:
    out = cases
    if lock:
        out = [c for c in out if lock in [str(x) for x in c.get("locks") or []]]
    if case_id:
        out = [c for c in out if c.get("id") == case_id]
    return out


def emit_brief(case: dict) -> str:
    locks = ", ".join(str(x) for x in case.get("locks") or [])
    steps = "\n".join(f"  - {s}" for s in case.get("steps") or [])
    expect = case.get("expect") or {}
    return f"""# Agent brief — {case['id']}: {case['title']}

## Locks
{locks}

## Domain / type
{case.get('domain')} / {case.get('type')}

## Fixtures
{case.get('fixtures')}

## Steps
{steps}

## Expect
```yaml
{yaml.safe_dump(expect, sort_keys=False).strip()}
```

## Pass criteria
{case.get('pass_criteria')}

## Rules
- Do not reopen locked decisions.
- Assert expect.status exactly.
- If harness missing: docs_pass only when locked docs forbid the bad path / require the good path.
"""


def dry_run_agents(cases: list[dict]) -> None:
    print("Dry-run agent briefs (no live API)\n")
    for brief_name, prefixes in AGENT_CASE_PREFIXES.items():
        path = BRIEFS / brief_name
        exists = "OK" if path.exists() else "MISSING"
        if prefixes:
            subset = [c for c in cases if any(c["id"].startswith(p) for p in prefixes)]
        else:
            subset = cases
        print(f"[{exists}] {brief_name}  cases={len(subset)}")
        for c in subset:
            status = (c.get("expect") or {}).get("status")
            print(f"    {c['id']:7} expect={status:16} | {c.get('pass_criteria')}")
        print()


def docs_check() -> list[str]:
    errors = []
    for path in DOC_PATHS:
        if not path.exists():
            errors.append(f"missing required path: {path}")
    # Path lock: testing pack must be under docs/senda-4.0/
    rel = PACK.relative_to(ROOT)
    if not str(rel).startswith("docs/senda-4.0/"):
        errors.append(f"testing pack not under docs/senda-4.0/: {rel}")
    return errors


def run_docs_cases(cases: list[dict]) -> list[str]:
    """Executable subset: DOC-* filesystem assertions."""
    failures = []
    for case in cases:
        if not case["id"].startswith("DOC-"):
            continue
        if case["id"] == "DOC-01":
            for p in [
                ROOT / "docs/senda-4.0/product/how-it-works.md",
                ROOT / "docs/senda-4.0/research/lock-brief.md",
                ROOT / "docs/senda-4.0/work-plan.md",
            ]:
                if not p.exists():
                    failures.append(f"{case['id']}: missing {p}")
        elif case["id"] == "DOC-04":
            if not (PACK / "README.md").exists():
                failures.append(f"{case['id']}: testing README missing")
        # DOC-02 stubs optional; DOC-03 policy-only
    return failures


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--coverage", action="store_true")
    parser.add_argument("--lock", help="Filter by lock id (e.g. 10, freshness)")
    parser.add_argument("--case", help="Single case id")
    parser.add_argument("--emit-brief", action="store_true")
    parser.add_argument("--dry-run-agents", action="store_true")
    parser.add_argument("--docs-check", action="store_true")
    args = parser.parse_args()

    if not SCHEMA.exists():
        print(f"schema missing: {SCHEMA}", file=sys.stderr)
        return 2
    if not FIXTURES.exists():
        print(f"fixtures missing: {FIXTURES}", file=sys.stderr)
        return 2

    schema = load_yaml(SCHEMA)
    cases = load_cases()
    errors = validate_cases(cases, schema)
    errors.extend(docs_check())
    errors.extend(run_docs_cases(cases))

    if errors:
        print("VALIDATION FAILED")
        for e in errors:
            print(f"  - {e}")
        return 1

    print(f"OK  cases={len(cases)}  fixtures={FIXTURES.name}  pack={PACK.relative_to(ROOT)}")

    selected = filter_cases(cases, args.lock, args.case)
    if args.case and not selected:
        print(f"case not found: {args.case}", file=sys.stderr)
        return 1

    if args.emit_brief:
        if len(selected) != 1:
            print("--emit-brief requires exactly one --case", file=sys.stderr)
            return 1
        print(emit_brief(selected[0]))
        return 0

    if args.dry_run_agents:
        dry_run_agents(selected if (args.lock or args.case) else cases)
        return 0

    if args.coverage or args.lock:
        if args.lock:
            print(f"Cases for lock={args.lock}: {len(selected)}")
            for c in selected:
                print(f"  {c['id']:7} {c['title']}")
            return 0
        return print_coverage(cases)

    # default: brief summary + coverage check
    rc = print_coverage(cases)
    if rc:
        print("\nGAP: one or more required locks have zero cases", file=sys.stderr)
        return rc
    print("\nAll required locks covered. Agent briefs:")
    for name in AGENT_CASE_PREFIXES:
        mark = "OK" if (BRIEFS / name).exists() else "MISSING"
        print(f"  [{mark}] agents/briefs/{name}")
    missing_briefs = [n for n in AGENT_CASE_PREFIXES if not (BRIEFS / n).exists()]
    return 1 if missing_briefs else 0


if __name__ == "__main__":
    sys.exit(main())
