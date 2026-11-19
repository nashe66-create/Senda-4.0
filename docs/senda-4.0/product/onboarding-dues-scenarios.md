# Onboarding + dues freshness — decision scenarios

**Status:** Founder decision brief (research / product lock). **No implementation in this doc.**  
**Audience:** Founder + ops; product/eng use for later lock-tests.  
**Wedge example:** UK → Zimbabwe **school fees**. Partners and billers stay generic; school is the first live biller type, not the forever limit.  
**Doctrine (locked):** Partner settles; Senda validate → ref → confirm → proof. Do **not** make institutions manage heavy dashboards. Prefer **onboarding before demo density**.  
**Related:** [how-it-works](./how-it-works.md) · [connect-concepts](./connect-concepts.md) · [pilot-runbook](./pilot-runbook.md) · [school-received confirmation](../research/school-received-confirmation.md) · [supply ZW schools](../research/supply-zw-schools.md) · [wedge comparison](../research/wedge-comparison.md) · [lock brief](../research/lock-brief.md) · [scenario catalog](../testing/scenario-catalog.md)

---

## 0. What this locks

Three open product questions for the ZW school wedge (and any later biller that reuses the same shapes):

| # | Decision | One-line ask |
| --- | --- | --- |
| **1** | Who sets up the organisation? | Ops-assisted vs self-serve vs hybrid |
| **2** | What must the organisation touch day-to-day? | Destinations + exceptions only vs student/bill lists as a habit |
| **3** | Where do amounts due come from? | Partner-entered vs organisation-published vs fee templates |

**Critical failure mode (must not ship without a plan):** School (or local parent) pays Term 1 locally; Senda’s open bill stays open; diaspora remittance pays again → **double pay / stale obligation**.

Plain words used below: **organisation / biller**, **who it’s for**, **pay code**, **amount due / bill**, **payout account**, **partner**, **payment proof**. System names (`Institution`, `Obligation`, …) appear only where useful for eng mapping.

---

## 1. Decision 1 — Who sets up the organisation?

### Options

| Option | Meaning | Fit for “onboarding before density” |
| --- | --- | --- |
| **A. Ops-assisted** | Senda ops (or founder) walks KYB, payout verify, roster import, first fee plan with the bursar. Biller login is for visibility + rare exceptions. | **Strong** — densifies carefully; quality gate before Connect goes live |
| **B. Self-serve** | Bursar completes checks, uploads CSV, sets templates, goes live alone. | Weak for first 5–10 schools; KYB/settle friction and WhatsApp-era bursaries |
| **C. Hybrid** | Ops does KYB + payout + first term; bursar owns later term refresh + exceptions in a thin Biller. | Strong once A proves the loop; default evolution of A |

### End-to-end scenarios

#### D1-H1 — Happy: ops-assisted first school

| Actor | Action |
| --- | --- |
| Ops | Collects KYB pack; verifies bank USD and/or school-owned EcoCash; imports roster CSV → people + pay codes; loads grade/class fee templates → bulk amounts due for Term 1 |
| Bursar | Confirms fee schedule + boarding flags once (WhatsApp / short call); signs into Biller only to see “live” strip |
| Partner | Sees organisation live on Connect; can validate pay codes + open bills |
| Senda knows | Verified org, verified payout account(s), roster Links, open Term 1 amounts due |
| Partner sees | Organisation + person + locked amount |
| Bursar must do | Near-zero after handoff (optional: glance at payment list) |
| Recon / proof | Normal validate → instruct → partner confirm → proven + proof |

#### D1-F1 — Failure: self-serve KYB stall

| Actor | Action |
| --- | --- |
| Bursar | Starts self-serve; cannot produce board resolution / EcoCash mandate for weeks |
| Senda knows | Org `pending`; not live on Connect |
| Partner sees | Organisation not available / validate fails `institution_not_live` |
| Bursar must do | Heavy document chase alone → abandons |
| Outcome | Density blocked; ops-assisted would have sequenced documents |

#### D1-F2 — Failure: ops skips payout ownership check

| Actor | Action |
| --- | --- |
| Ops | Marks EcoCash “verified” but till is a relative’s MSISDN |
| Partner | Instructs → settles to wrong wallet |
| Senda knows | False verified destination; later may still mark proven on partner attest |
| Bursar | Never sees funds; disputes → `needs_reconcile` |
| Outcome | Stage kill risk; reinforces ops quality gate on Decision 1 |

#### D1-H2 — Happy: hybrid after term 1

Ops repeats nothing for Term 2 except hygiene. Bursar confirms templates + roster upsert (or ops does it in a 15‑minute call). Same Connect path.

**Stress verdict for Decision 1:** Start **ops-assisted (A)** for the ZW pilot. Design Biller so **hybrid (C)** is a small step, not a rewrite. Do not bet pilot density on pure self-serve.

---

## 2. Decision 2 — What must the organisation touch day-to-day?

Principle: **thin biller** — beside school finance tools; not a second ERP.

### Options

| Option | Day-to-day touch | Risk |
| --- | --- | --- |
| **A. Destinations + exceptions only** | Change payout account (rare); mark join/leave; amount override; optional “paid locally”; download proof. **No** habit of editing full student/bill grids. | Stale dues if local pays never reach Senda (see §4) |
| **B. Student / bill lists as operating surface** | Bursar maintains open bills like a mini ledger every week | Heavy dashboard; conflicts with ZivoFees/Excel; adoption death |
| **C. Visibility-only** | Read payments/proofs; all writes via ops | Lowest bursar burden; ops bottleneck; freshness SLA owned by Senda |

### End-to-end scenarios

#### D2-H1 — Happy: thin touch (A)

| Phase | Who | What |
| --- | --- | --- |
| Term start | Ops (+ bursar confirm) | Templates → bulk amounts due |
| Mid-term | Partner | Pays Ada Term 1 → proven; Senda closes that bill automatically |
| Mid-term | Bursar | Optionally opens Biller → sees Confirmed + downloads proof; **no required click** |
| Exception | Bursar or ops | Sibling discount override on one student |
| Destination | Bursar + ops | New bank account → re-verify before new instructs |

Bursar work: rare. Partner work: normal Connect. Recon: automatic on match.

#### D2-F1 — Failure: bill-list habit (B)

Bursar asked to tick 200 rows weekly. After two weeks they stop. Open bills drift. Partner still sees stale open amounts → double-pay risk (§4). Product “succeeded” as software and failed as habit.

#### D2-F2 — Failure: visibility-only with no ops SLA (C without hygiene)

No one marks local pays; no term refresh. Connect still shows open Term 1. Partner remits again. School has cash twice; trust collapses.

#### D2-H2 — Happy: destinations-only change

Bursar reports new USD nostro. Ops re-verifies. In-flight instructs keep **frozen** old snapshot; new instructs use new destination. Bursar never manages a payment dashboard beyond “Destination checks.”

**Stress verdict for Decision 2:** Lock **A — destinations + exceptions (+ optional local-paid mark)**. Biller = proof visibility + rare writes. Reject B as day-one product shape. Use C only as a temporary ops mode for the first 1–2 schools, with a written weekly hygiene SLA.

---

## 3. Decision 3 — Where do amounts due come from?

### Options

| Option | Source of locked amount | Freshness | Moat |
| --- | --- | --- | --- |
| **A. Partner-entered** | Payer/partner types amount at pay time | Always “fresh” to payer intent; **wrong for allowlist** | Weak — no Obligation truth |
| **B. Organisation-published (ad-hoc bills)** | Bursar (or ops) creates each bill row | Accurate if maintained; high touch | Medium |
| **C. Fee templates → bulk amounts due** | Grade/class/(boarding) plan assigned to roster | Term cadence; exceptions for outliers | **Strong** — matches ZW school tools + locked freshness prefs |

### End-to-end scenarios

#### D3-H1 — Happy: templates (C)

1. Ops/bursar sets Form 4 Day = 850 USD Term 1.  
2. Senda bulk-creates open amounts due for matching students.  
3. Partner lookup → pay code + locked 850.  
4. Validate/instruct require that amount; confirm exact match → proven.  
5. Proven closes/adjusts that bill; next term needs a new plan assign (FR-09 class).

#### D3-F1 — Failure: partner-entered (A)

Partner accepts “whatever the cousin said.” Amount ≠ school schedule. School ledger disagrees. Proof means “partner paid X,” not “right obligation.” Undermines purpose-settlement claim. **Reject for MVP Connect.**

#### D3-H2 — Happy: published exception on top of templates (B as exception, not primary)

Template says 850; scholarship student → Biller override 400. Partner sees 400. Same validate/instruct/confirm path.

#### D3-F2 — Failure: organisation-published only at scale (B primary)

Bursar must create 600 bills by hand each term. Same pain as daily CSV. Drift and abandonment.

#### D3-F3 — Failure: no open amount due

Student on roster, no Term 2 plan assigned. Validate/instruct → reject (`obligation_not_found` / not open). Correct: force term refresh; do not invent amount at pay time.

**Stress verdict for Decision 3:** Lock **C — fee templates → bulk amounts due**, with **B only as exceptions**. Partner-entered amounts stay out of Connect validate/instruct for the school wedge.

---

## 4. Stale dues / local payment race (critical)

### The race in one paragraph

Term 1 bill is **open** on Senda. Local parent pays the school (cash, Paynow, ZIPIT, EcoCash till, bank with student name). School’s own books show paid. Senda still shows open. UK relative pays via partner → Connect instructs → partner settles → confirm → **proven**. School has been paid twice (or holds an overpay). Cousin path / diversion pain is replaced by **Senda-induced double settle**.

### Design constraints already locked

- Local ZW payer **product** deferred; optional manual “external / paid locally” write is allowed.  
- CSV = onboarding / term roster, not daily freshness.  
- Fetch-at-pay: refuse or flag **stale** / non-open bills.  
- Day-one confirm = partner attestation (L1), not bank feed.  
- Refunds: **out of scope day one** — prevention + `needs_reconcile` beat automated clawback.

### Plausible paths (every path)

| ID | Path | Who acts | What Senda knows | What partner sees | What bursar must do | Recon / proof outcome |
| --- | --- | --- | --- | --- | --- | --- |
| **SD-LP-01** | **Bursar marks paid locally** before remittance | Bursar (or ops) marks external pay on bill | Bill closed / paid_external; not open | Validate/instruct **reject** (not open) | One mark (or WhatsApp ops to mark) | No second instruct; **preferred MVP prevention** |
| **SD-LP-02** | Local pay; **nobody marks**; partner remits | Partner settles open bill | Still open → instruct allowed | Open amount due | Nothing until dispute | **False proven** on remittance; school double-paid → dispute → `needs_reconcile`; ops manual |
| **SD-LP-03** | **Bank feed** credits school with student ref (future L3) | Bank/AIS matcher | Auto-close or flag bill paid_external | Reject subsequent instruct | Near-zero | Prevents race when feed live; **not day one** |
| **SD-LP-04** | **EcoCash till event** (future L3) | Till/merchant report | Same as bank feed for ecocash destination | Reject if closed | Near-zero | Prefer first school-received signal later; **not day one** |
| **SD-LP-05** | **CSV / term refresh** after local pays | Ops/bursar re-imports balances or regenerates open dues from “still owing” list | Open set replaced | Only remaining open bills payable | Term-bulk, not daily | Acceptable pilot mitigation if local-mark habit fails |
| **SD-LP-06** | Partner validates; **Senda refuses** (stale / not open / mid-flight) | Partner at validate | Status blocks pay | Clear error: out of date / not payable | None if status correct | **Hard gate** — must be reliable |
| **SD-LP-07** | **Overpay** (local partial + remittance full, or remittance > due) | Partner confirm amount | Instruct was for full locked amount | Confirm may match instruct while school already had cash | Dispute / ops | MVP exact-match on instruct vs confirm; overpay vs school ledger → `needs_reconcile`; **no auto-refund day one** |
| **SD-LP-08** | **Partial** local pay; remittance for remainder | Ideal: bill amount reduced or split | Open remainder only | Partner pays remainder | Mark partial or override amount | If amount not updated → SD-LP-02; if confirm partial vs full instruct → `needs_reconcile` (RC-10 class) |
| **SD-LP-09** | **Sibling / term mix** — local pay applied to wrong child or wrong term on school books; Senda bill still open | Bursar school ledger vs Senda | Wrong bill still open | Partner can still pay “open” bill | Correct allocation in school tools; mark correct Senda bill | High confusion; ops recon; proof may be “right ref wrong economic intent” |
| **SD-LP-10** | Remittance in flight; bursar marks local paid | Race on instructed bill | Attempt `instructed`; bill mid-flight | Partner still settling | Mark should warn: pay in flight | Prefer block external-close while instructed **or** force `needs_reconcile` on confirm; never silent double-proven |
| **SD-LP-11** | Partner confirm after local pay already closed bill | Late confirm | Bill closed externally; attempt still instructed | Confirm posted | Ops | Confirm → `needs_reconcile` (do not proven against closed bill) |
| **SD-LP-12** | **needs_reconcile** from mismatch or dispute | Ops | Attempt flagged | Partner notified (later webhook) | Optional evidence upload later | Human resolve; no silent proof |
| **SD-LP-13** | Refund request after double pay | School / payer | Proven already issued | — | Finance outside Senda | **Out of scope day one** — document “contact partner + school”; Senda retains proof trail only |

### Pilot operating rule (recommended)

Until bank/EcoCash feeds exist:

1. **Obligation-required + fetch-at-pay** (no open/stale → no instruct).  
2. **One-open-attempt** policy for a bill (second instruct while instructed → reject or explicit edge).  
3. **Cheap prevention:** WhatsApp/ops “mark paid locally” for diaspora-linked students **or** term refresh from bursar’s “still owing” export before heavy remittance weeks.  
4. **Do not** require daily local-payment logging for all 600 students.  
5. Double-pay discoveries → `needs_reconcile` + ops playbook; refunds offline.

---

## 5. Schools vs medical aid vs funeral policies

Same Connect spine (org → payout → who it’s for → pay code → amount due → instruct → confirm → proof). Freshness and onboarding **must differ** by vertical.

| Dimension | **Schools (wedge)** | **Medical aid (later)** | **Funeral / policies (later)** |
| --- | --- | --- | --- |
| **Periodicity** | Term (~3/year); bulk template regenerate | Monthly premiums **or** ad-hoc invoices/shortfalls | Usually monthly premium; lapse/cancel sensitive |
| **Who “who it’s for” is** | Student (open Link student+school) | Member / patient; invoice may lack stable person id | Policyholder / policy number (fetch-strong) |
| **Where dues come from** | Fee templates + exceptions | Premium schedule fetch **or** uploaded invoice amount (messy) | Policy balance fetch (often incumbent-owned) |
| **Local vs remittance race** | Very common (cash/Paynow/EcoCash at school) | Premium often debit-order/local; shortfall invoices chaotic | Premiums often USSD/card to assurer; less “bursar desk” race, more **lapse** race |
| **Cancellation / lapse** | Leave school / term rollover | Membership suspend; waiting periods | Cover lapse if premium missed — paying wrong period is harmful |
| **Arrears** | Common; partial plans; sibling discounts | Shortfalls + provider tariffs | Arrears may mean **no cover** at claim time |
| **Onboarding** | 5–10 schools; KYB + roster CSV; ops-assisted | Provider sprawl **or** society-level premium API | Few assurers; IPEC/AML; incumbent collection rails |
| **Day-to-day org touch** | Must stay thin (destinations + exceptions) | Clinician/admin invoice upload would be heavy — avoid as first shape | Assurer ops / API; not a school-like Biller |
| **Stale-dues contrast** | Double **fee** pay (money excess at school) | Double premium or paying closed shortfall; clinical billing disputes | Paying lapsed policy or wrong term; compliance + cover state |
| **Solution must differ** | Templates + term hygiene + optional local-mark | Prefer premium fetch before hospital invoices; don’t reuse school term UX | Policy-number fetch + lapse state machine; heavier CDD |

**Do not** copy school Biller UX onto medical invoices or funeral premiums. Reuse Connect proof; replace freshness model per vertical.

---

## 6. Recommended default (ZW school wedge)

### Lock these for pilot

| # | Recommendation | Rationale |
| --- | --- | --- |
| **1** | **Ops-assisted onboarding**, evolving to **hybrid** after first term | KYB/settle quality; bursar time; “onboarding before density” |
| **2** | **Thin biller:** destinations + exceptions + proof visibility; optional “paid locally” | No heavy dashboards; beside school systems |
| **3** | **Fee templates → bulk amounts due**; exceptions for overrides; **not** partner-entered amounts | Matches locked freshness + ZW bursar habits; CSV onboarding/term only |

### How dues stay fresh with minimal bursar work

```
Onboarding (ops-led):  KYB → payout verify → roster CSV → pay codes
                       → fee templates → bulk Term N amounts due
Auto:                  proven Connect pays close/adjust bills
Rare bursar/ops:       join/leave, amount override, payout change,
                       mark paid locally (diaspora-linked / known local settle)
Term boundary:         new templates/assign OR “still owing” refresh
Gates:                 no open/non-stale bill → no instruct
                       mid-flight / closed → no second silent proven
Pilot ops:             weekly hygiene; unmaintained school off live Connect
Later:                 EcoCash till / bank feed to close local pays (L3)
Never day one:         ERP sync as requirement; daily 600-row CSV; auto-refunds
```

### Open risks (founder should accept or reopen)

1. **Local-pay mark adoption** — if bursars won’t mark and won’t send “still owing” lists, double-pay rate rises until feeds exist.  
2. **Sibling/term misallocation** — school books vs Senda bill identity; ops load.  
3. **Partner attestation ≠ received** — separate from stale dues; see school-received research (L1 vs L3).  
4. **Self-serve pressure** — partners may want instant school signup; resist until hybrid is proven.  
5. **Vertical creep** — medical/funeral freshness looks “easier to fetch” but different failure modes; do not swap wedge to escape school local-pay race.

---

## 7. Scenarios to promote to lock-test YAML later

List only — **do not** expand into the full pack here. Target home: `docs/senda-4.0/testing/` (catalog + `cases/all-cases.yaml`).

Existing related IDs to keep: `FR-01`–`FR-09`, `LP-01`–`LP-03`, `AB-02`, `RC-10`, `OP-03`–`OP-04`.

### Proposed new IDs (titles only)

| ID | Title |
| --- | --- |
| **OB-01** | Ops-assisted onboarding happy path (KYB → payout → roster → templates → live) |
| **OB-02** | Self-serve KYB incomplete → not live on Connect |
| **OB-03** | Hybrid term-2 refresh without full re-KYB |
| **OB-04** | Unverified / relative EcoCash destination rejected |
| **TB-01** | Thin biller: proof download with zero bill-grid edits |
| **TB-02** | Exception amount override without full CSV rewrite |
| **TB-03** | Reject “daily student/bill list maintenance” as required process |
| **DU-01** | Fee template bulk-generate open amounts due |
| **DU-02** | Partner-entered amount rejected at validate/instruct |
| **DU-03** | No open amount due → instruct reject |
| **DU-04** | Term rollover without new plan → reject |
| **SD-LP-01** | Bursar marks paid locally → subsequent instruct reject |
| **SD-LP-02** | Local pay unmarked → remittance can false-proven (dispute → needs_reconcile) |
| **SD-LP-05** | Term “still owing” refresh removes paid rows from open set |
| **SD-LP-06** | Validate refuses stale / not-open bill |
| **SD-LP-07** | Overpay / already-paid + full remittance → needs_reconcile; no auto-refund |
| **SD-LP-08** | Partial local pay without amount update → race (expect fail until override) |
| **SD-LP-09** | Sibling/term mix misallocation → ops recon |
| **SD-LP-10** | External mark while attempt instructed → warn / needs_reconcile path |
| **SD-LP-11** | Confirm against externally closed bill → needs_reconcile not proven |
| **SD-LP-13** | Refund after double pay out of scope (policy) |
| **VX-01** | Medical-aid premium fetch shape ≠ school term template (policy contrast) |
| **VX-02** | Funeral policy lapse state blocks pay (policy contrast) |
| **VX-03** | School local-desk race ≠ funeral USSD premium race (policy contrast) |

---

## 8. Ask of the founder

Please **lock §6** (or rewrite the three defaults). Especially confirm:

1. Ops-assisted first 5–10 schools (not self-serve).  
2. Thin biller — no bill-list operating habit.  
3. Templates + optional local-paid mark / term “still owing” refresh as the day-one answer to double pay — accepting feed-based close as later.

Silent approval of this doc = treat §6 as the working product default for build sequencing after current M-milestones.
