# Senda 4.0 branch and pull-request audit

## Baseline and evidence

- **Baseline:** `main` / `origin/main` / `HEAD` = `4bf9ed5dbe46e454baaa176f0c62df634230e173`.
- At the baseline check, local `main` tracked `origin/main` and there were no tracked changes; the pre-existing `docs/senda-4.0/audits/full-audit/` report directory was untracked. This continuation modifies only Markdown audit files in that directory.
- `git branch -a -vv`, `git merge-base`, `git rev-list --left-right --count`, `git diff --stat`, and `git diff --name-status` were used for refs and branch comparisons. Counts below are **branch ahead / branch behind** relative to `main`.
- `gh auth status`, `gh pr list --state all`, `gh pr view` and REST review/comment/check endpoints were available for `nashe66-create/Senda-4.0` (default branch `main`); 15 PRs were returned. All 15 had zero issue-conversation comments, submitted reviews, inline review comments, head-commit check runs, and commit status contexts at audit time. `gh run list --limit 30` returned no workflow runs. These are endpoint observations at audit time, not evidence that checks never existed historically.
- Triple-dot file differences are against each branch's merge base. A branch that is behind `main` and has no branch-only commits has no unique patch to merge.

## Local and remote branch refs

There is one local branch (`main`). `origin/HEAD` is a symbolic ref to `origin/main`, not an additional branch. The nine remote feature branches plus `origin/main` match the ten branches listed by GitHub.

| Branch | Tip | Merge base with `main` | Ahead / behind | Unique tree diff from merge base | Recommendation |
|---|---|---|---:|---|---|
| `main` | `4bf9ed5dbe46` | `4bf9ed5dbe46` | 0 / 0 | Baseline; 88 tracked files | Continue from this exact baseline |
| `origin/main` | `4bf9ed5dbe46` | `4bf9ed5dbe46` | 0 / 0 | None | In sync with local baseline |
| `origin/cursor/add-senda-4-pivot-doc-3bc0` | `285380e99c77` | `5c7bbd8c2480` | 1 / 33 | Adds `senda/docs/senda-4.0-pivot.md` (70 lines) | Old pivot-only snapshot, associated with closed PR #1; no merge as-is. Canonical project pivot already lives at `docs/senda-4.0/pivot.md`; retain only if the legacy copy has unique value |
| `origin/cursor/biller-bursar-surface-8d87` | `2561237cb22c` | `2561237cb22c` | 0 / 6 | None; topic commit is in main history | Merged PR #13; do not cherry-pick |
| `origin/cursor/connect-concepts-doc-9c8e` | `6ddca3e13d8b` | `6ddca3e13d8b` | 0 / 16 | None; commit is in main history | PR #9 closed without merge, but docs are integrated through the language-pass merge; no cherry-pick |
| `origin/cursor/connect-partner-hardening-1927` | `941f3c110530` | `941f3c110530` | 0 / 8 | None; topic commit is in main history | Merged PR #12; do not cherry-pick |
| `origin/cursor/mismatch-kyb-checklist-7986` | `81937eb8b6d7` | `81937eb8b6d7` | 0 / 11 | None; topic commit is in main history | Merged PR #11; do not cherry-pick |
| `origin/cursor/onboarding-dues-scenarios-53ef` | `8d8a1e5d6eeb` | `e8a9182b8943` | 2 / 2 | Adds `docs/senda-4.0/product/onboarding-dues-scenarios.md` (307 lines) and links it from `docs/senda-4.0/README.md` | Open PR #15. Review the content against the current schema, APIs and accepted onboarding model; keep as a documentation-only proposal unless decisions/owners are validated. Do not merge solely because it is ahead |
| `origin/cursor/scaffold-mvp-app-3a57` | `1e4b55df7b1d` | `1e4b55df7b1d` | 0 / 17 | None; scaffold commit is in main history | PR #8 closed without merge; scaffold was subsequently merged via main's history. No cherry-pick |
| `origin/cursor/wedge-pilot-loop-ee1f` | `b45578a8ec94` | `b45578a8ec94` | 0 / 3 | None; topic commit is in main history | Merged PR #14; do not cherry-pick |
| `origin/docs/kuva-cash-feedback-nov18` | `b855f3b82949` | `0055b2131f34` | 1 / 23 | Adds `docs/senda-4.0/research/kuva-cash-feedback.md` (75 lines) | No PR in the returned 15-PR list. Retain as an explicitly single-conversation, directional note; validate regulatory, competitor and market claims before promoting them to evidence or decisions |

Merge-base and diff interpretation: `biller`, `connect-concepts`, `hardening`, `mismatch`, `scaffold`, and `wedge` point to commits that are ancestors of `main`; their behind counts are historical lag, not unmerged work. The two open research/doc deltas are the only branches with live unique changes beyond the old pivot-only branch. No branch or remote ref was altered.

### Unique commit and patch crosswalk against `main`

`git rev-list main..<branch>` was checked for every remote tip. A branch commit is “unique” here only if it is not reachable from target `main`; stale commits already integrated into `main` are not repeated. The commit-history manifest gives each listed SHA's author/date and broader change/security disposition.

| Branch | Commits not reachable from main | Unique diff from merge base |
|---|---|---|
| `origin/main` | None | None |
| `origin/cursor/add-senda-4-pivot-doc-3bc0` | `285380e99c77c078af17bd66de36aa03b6a4d4bb` | Adds legacy-path `senda/docs/senda-4.0-pivot.md` (70 lines); path now exists in main as a redirect with different content |
| `origin/cursor/biller-bursar-surface-8d87` | None | None; tip commit `2561237…` is an ancestor of main |
| `origin/cursor/connect-concepts-doc-9c8e` | None | None; tip commit `6ddca3e…` is an ancestor of main |
| `origin/cursor/connect-partner-hardening-1927` | None | None; tip commit `941f3c1…` is an ancestor of main |
| `origin/cursor/mismatch-kyb-checklist-7986` | None | None; tip commit `81937eb…` is an ancestor of main |
| `origin/cursor/onboarding-dues-scenarios-53ef` | `3083f09cac67980fc26917501508dcefd65778ca`; `8d8a1e5d6eeb1d771e58a56b1f8270c9b4be31df` | Adds `docs/senda-4.0/product/onboarding-dues-scenarios.md` (307 lines) and adds a README index link (1 line) |
| `origin/cursor/scaffold-mvp-app-3a57` | None | None; tip commit `1e4b55d…` is an ancestor of main |
| `origin/cursor/wedge-pilot-loop-ee1f` | None | None; tip commit `b45578a…` is an ancestor of main |
| `origin/docs/kuva-cash-feedback-nov18` | `b855f3b8294948e14a62455ccb19d08903e738c8` | Adds `docs/senda-4.0/research/kuva-cash-feedback.md` (75 lines) |

Thus the non-main remote-tip delta is four unique commits across three branches; branch tips that are ancestors of main have zero non-main commits and zero unique patch. Five host checkpoint commits appear under `git rev-list --all` but are not remote branch tips and are itemized separately in `commit-history-audit.md`.

## Pull-request inventory

| PR | State / merged | Head → base | Topic | Audit recommendation |
|---:|---|---|---|---|
| [#15](https://github.com/nashe66-create/Senda-4.0/pull/15) | OPEN / — | `cursor/onboarding-dues-scenarios-53ef` → `main` | Onboarding + dues freshness decision scenarios | Useful ops-assisted onboarding, thin-Biller and local-pay/double-settlement scenarios; review the proposed policy decisions and owners before merge. Its recommended one-open-attempt rule is not enforced by current code, which allows validation when an obligation is already `instructed`; prioritize an API/integration regression test and lifecycle fix separately from merging docs |
| [#14](https://github.com/nashe66-create/Senda-4.0/pull/14) | MERGED / 2026-11-19 | `cursor/wedge-pilot-loop-ee1f` → `main` | M6 guided pilot end-to-end loop | Integrated; no cherry-pick. UI/handoff security and attestation semantics remain audit findings |
| [#13](https://github.com/nashe66-create/Senda-4.0/pull/13) | MERGED / 2026-11-19 | `cursor/biller-bursar-surface-8d87` → `main` | M5 Biller surface | Integrated; no cherry-pick. Biller auth remains a prototype-only blocker |
| [#12](https://github.com/nashe66-create/Senda-4.0/pull/12) | MERGED / 2026-11-19 | `cursor/connect-partner-hardening-1927` → `main` | M4 auth, confirm, retry keys and sandbox docs | Integrated; improves partner-key auth but does not scope retry keys to partner or fix Biller sessions |
| [#11](https://github.com/nashe66-create/Senda-4.0/pull/11) | MERGED / 2026-11-19 | `cursor/mismatch-kyb-checklist-7986` → `main` | Mismatch dogfood path and thin KYB checklist | Integrated; no cherry-pick |
| [#10](https://github.com/nashe66-create/Senda-4.0/pull/10) | MERGED / 2026-11-19 | `cursor/plain-language-pass-fc5c` → `main` | Generic partner/biller wording and UI glossary | Integrated; labels still map partner attestation to “Confirmed” |
| [#9](https://github.com/nashe66-create/Senda-4.0/pull/9) | CLOSED / not merged | `cursor/connect-concepts-doc-9c8e` → `main` | Connect/Biller conceptual model | Topic commit is in the main graph through a later merge; no cherry-pick |
| [#8](https://github.com/nashe66-create/Senda-4.0/pull/8) | CLOSED / not merged | `cursor/scaffold-mvp-app-3a57` → `main` | M1 app scaffold | Scaffold commit is in the main graph; no cherry-pick |
| [#7](https://github.com/nashe66-create/Senda-4.0/pull/7) | MERGED / 2026-11-18 | `cursor/school-received-confirmation-2248` → `main` | School-received confirmation research | Integrated; useful distinction between partner attestation and actual receipt |
| [#6](https://github.com/nashe66-create/Senda-4.0/pull/6) | MERGED / 2026-11-18 | `cursor/scenario-test-pack-locks-806e` → `main` | 95-case policy/test specification | Integrated; pack validator passes but does not execute application behavior |
| [#5](https://github.com/nashe66-create/Senda-4.0/pull/5) | MERGED / 2026-11-18 | `cursor/lock-decision-10-zw-settle-d2cd` → `main` | Zimbabwe settlement method lock | Integrated |
| [#4](https://github.com/nashe66-create/Senda-4.0/pull/4) | MERGED / 2026-11-18 | `cursor/port-senda40-research-docs-fd96` → `main` | Research pack and stack decision | Integrated; public research claims were not independently revalidated here |
| [#3](https://github.com/nashe66-create/Senda-4.0/pull/3) | MERGED / 2026-11-19 | `cursor/add-bbps-india-study-3bc0` → `main` | Bharat Connect study | Integrated |
| [#2](https://github.com/nashe66-create/Senda-4.0/pull/2) | MERGED / 2026-11-18 | `cursor/commit-senda4-durable-docs-4a0d` → `main` | Durable Senda 4.0 docs | Integrated; changed initial corridor framing to UK→Zimbabwe |
| [#1](https://github.com/nashe66-create/Senda-4.0/pull/1) | CLOSED / not merged | `cursor/add-senda-4-pivot-doc-3bc0` → `main` | Pivot document | Its unique legacy-path copy is on the old branch only; canonical pivot exists in main. Do not merge the stale tree |

PR states and merge dates are from GitHub metadata at audit time. PR #1, #8 and #9 are closed without merge; their tree/head status must not be inferred from their titles alone. The returned list did not show a PR for the Kuva Cash branch.

### Pull-request diff, review and CI evidence

The GitHub CLI exposed each PR head/base, complete changed-file list and additions/deletions via `gh pr view --json files`; the rows below record that metadata. The PR descriptions and topic patches were compared against the local commit/branch history. For review evidence, REST endpoints `GET /issues/{n}/comments`, `GET /pulls/{n}/reviews`, and `GET /pulls/{n}/comments` each returned empty arrays for every PR (#1–#15). For checks, `GET /commits/{head}/check-runs` and `/status` returned zero check runs and zero status contexts for all 15 head SHAs; the PR check-rollup fields were empty and `gh run list` returned `[]`. No review decision, approval, CI pass, or CI failure is therefore evidenced by the available records. No comments were available to quote or adjudicate.

| PR | Changed files | Diff additions / deletions | Review/comment records | Head checks / statuses |
|---:|---:|---:|---|---|
| #1 | 1 | +70 / −0 | 0 / 0 / 0 | 0 / 0 |
| #2 | 3 | +234 / −0 | 0 / 0 / 0 | 0 / 0 |
| #3 | 5 | +171 / −0 | 0 / 0 / 0 | 0 / 0 |
| #4 | 15 | +1,426 / −230 | 0 / 0 / 0 | 0 / 0 |
| #5 | 11 | +51 / −41 | 0 / 0 / 0 | 0 / 0 |
| #6 | 20 | +2,388 / −1 | 0 / 0 / 0 | 0 / 0 |
| #7 | 2 | +447 / −0 | 0 / 0 / 0 | 0 / 0 |
| #8 | 42 | +10,231 / −5 | 0 / 0 / 0 | 0 / 0 |
| #9 | 3 | +493 / −0 | 0 / 0 / 0 | 0 / 0 |
| #10 | 57 | +10,941 / −111 | 0 / 0 / 0 | 0 / 0 |
| #11 | 9 | +471 / −58 | 0 / 0 / 0 | 0 / 0 |
| #12 | 14 | +664 / −154 | 0 / 0 / 0 | 0 / 0 |
| #13 | 7 | +559 / −140 | 0 / 0 / 0 | 0 / 0 |
| #14 | 13 | +1,139 / −24 | 0 / 0 / 0 | 0 / 0 |
| #15 | 2 | +308 / −0 | 0 / 0 / 0 | 0 / 0 |

Review/comment columns are issue comments / submitted reviews / inline review comments. Check columns are GitHub check runs / commit status contexts. The diff totals are GitHub's PR file-list metadata, not a test result. The list includes the same main or docs changes as the branch/commit manifests; it does not mean every final file on a stale PR branch is unique to main.

All 15 PR file lists were cross-checked against `git diff --name-only <base>...<head>` using their exact GitHub base/head SHAs; each path set matched with no missing or extra file. PR #15's complete 307-line decision brief and one-line README change were read. It is documentation only, and the proposed scenarios should not be mistaken for delivered controls:

- The proposal recommends rejecting a second instruction while a bill is `instructed`, handling a local-paid/in-flight race, and placing late confirmation against an externally closed bill into `needs_reconcile`.
- Current Connect validation explicitly accepts both `open` and `instructed` obligations, and instruction creation changes an obligation to `instructed`. The app has no biller/ops local-paid action or `paid_external` implementation in the inspected `apps/web` tree. Existing confirmation checks reference/amount/currency and marks a match `proven`; it does not independently establish school receipt/allocation or verify that the bill remained payable after a local close.
- Therefore the brief is a useful proposed operating/product decision, not an accepted decision (no review/approval record exists) or executable safeguard. Before relying on it, product owners must accept the recommended defaults and engineering must implement lifecycle constraints and tests for one-active-attempt, external/local-paid updates, in-flight races and late confirms.

## Branch-level risks and disposition

1. **Open PR #15:** documentation-only; no app implementation or executable tests. Its local-pay race analysis identifies a concrete current gap: `validatePayment` accepts both `open` and `instructed`, so a new retry key can create another attempt for a bill already in flight; no one-active-attempt constraint is present. Add executable race/duplicate-instruct coverage and enforce an explicit state policy in the app before relying on the proposed pilot safeguards. Review assumptions on who onboards, dues freshness and local-pay/double-settlement before adopting.
2. **Kuva Cash branch:** useful qualitative signal, explicitly one former-employee conversation. Its legal/regulatory and competitor assertions need primary-source/legal review; it is not evidence that a partner or biller has agreed.
3. **Pivot branch / PR #1:** stale relative to `main`; contains only a duplicate legacy-path pivot note. Do not fast-forward or merge its 33-commit-behind snapshot.
4. **Merged feature branches:** all are ancestors of `main`; cherry-picking would duplicate already-integrated changes and risk conflicts.
5. **No branch identified as a tested release:** no runtime/test/CI result is asserted from branch metadata. The test-pack result appears in the inventory; it is specification validation only.

## Non-branch refs discovered by `git log --all`

In addition to `git branch -a`, `git show-ref` exposed one host-managed ref namespace, `refs/agents/58d148a1-663c-490c-8aec-c8dad3467193/checkpoints/turn/{0,1,2}` plus an associated baseline checkpoint. These are **not** local or remote branches and are not listed by `git branch -a`. They account for five additional commits under `git log --all`; the root snapshot tree is byte-for-byte identical to target `HEAD`, followed by three empty checkpoint commits and one checkpoint commit containing only nine full-audit Markdown files. The exact reachable SHAs and path changes are in `commit-history-audit.md`. Their existence is not a reason to alter or delete refs during this audit.

## External blockers

- GitHub branch and PR metadata were available through `gh`; there was no access blocker for branch enumeration.
- The available PR comment/review and check endpoints were queried and returned no records for #1–#15. Consequently there are no recorded PR review comments or CI results to inspect; historical records outside these endpoint responses cannot be inferred.
- There is no evidence from Git alone of live partners, payment rails, legal sign-off, real institution enrollment, or real settlement. These are external validation blockers, not branch defects.
