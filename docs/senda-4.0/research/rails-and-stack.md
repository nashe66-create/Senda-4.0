# Workstream C — Settle rails + stack fit (#9 / #10)

**Status:** Research for lock brief (web/public sources only; no partner interviews).  
**Corridor:** UK → Zimbabwe private school fees.  
**Doctrine context:** Partners move money (`mto_settles`); Senda owns Links, refs, validation, recon, proof. Biller sits **beside** school finance tools. No neural net day one. Dogfood UI = yes (minimal).

**Locks this doc informs:** Decision **#9** (tech stack) — **LOCKED** in preferences + lock-brief; Decision **#10** (ZW settle methods) — **proposed** (pending).

---

## 1. How school fees actually land in Zimbabwe

Private schools collect term fees in **USD-first** practice, with ZiG/ZWG as secondary. Public school-payment pages and school-ops platforms (e.g. Heritage School, Makronexus) show a recurring pattern:

| Rail | What it is | Typical school use | Diaspora / MTO relevance |
| --- | --- | --- | --- |
| **Bank USD (nostro / FCA)** | School’s USD current/business account at a commercial bank | Primary bursar destination for term fees; statement + reference recon | **Highest.** WorldRemit and peers explicitly pay USD bank (nostro FCA details). Remitly lists bank deposit for ZW. |
| **EcoCash (esp. USD wallet)** | Econet mobile money; person or merchant till | Widely used for fees; EcoCash public posts list many schools accepting multi-currency EcoCash; EcoCash ↔ bank wallet links at Steward, CBZ, Stanbic, BancABC, ZB, POSB, NBS, Nedbank | **High.** Mukuru, Remitly, WorldRemit, Western Union, Sasai credit EcoCash wallets. EcoCash Diaspora Wallet (UK/SA) lets abroad payers fund via Visa/MC and pay merchants/school fees directly — **competes with / bypasses MTO purpose flow**. |
| **Paynow** | Domestic merchant PSP (cards, Zimswitch, EcoCash, OneMoney, InnBucks, O’Mari, etc.) | Schools put a Paynow button on the website; Paynow settles net to the school’s **Zimbabwe bank account** (local methods ~T+1; local Visa ~T+2; foreign Visa ~T+3) | **Low for MTO instruct.** Useful as **school-side local/card collection**, not as the destination string an MTO remittance API hits. |
| **ZIPIT (Zimswitch)** | Instant domestic bank↔bank / bank↔wallet / merchant-code pay | Local parent/guardian instant transfer; Stanbic Blue247 has dedicated **school-code** fee pays with SMS to school | **Low for UK MTO.** Domestic rail; USD ZIPIT exists but published per-tx / monthly caps are often below a full private-school term fee. Not a typical cross-border remittance payout API target. |
| **RTGS / EFT** | Same-day or next-day bank clearing | Larger bursar transfers when ZIPIT limits bite | Same as bank destination; timing/cutoffs matter for recon SLAs, not a separate SettleDestination type. |
| **InnBucks / OneMoney / Telecash** | Secondary wallets | Some schools/platforms accept; Paynow can aggregate | Niche for pilot; enum later if a school’s only till is one of these. |
| **Cash / agent pickup** | Mukuru booth, WU agent, bank cash | Common for **person** remittances | **Out of scope as school SettleDestination** — reintroduces diversion and breaks institution proof. |

### Practical landing paths (today)

1. **Abroad → MTO → school USD bank** with a reference (best fit for Senda `mto_settles` + recon).  
2. **Abroad → MTO → EcoCash wallet** (often a relative’s or school’s registered number) → school uses EcoCash pay or bank-to-wallet. Proof quality depends on whether the **school-owned** wallet is the frozen destination.  
3. **Abroad → EcoCash Diaspora Wallet / card-to-Paynow** → school merchant — **purpose payment without Senda**. Competitive bypass; Senda must win on allowlisted Obligation + shared proof for MTOs/schools, not on being the only way to pay.  
4. **Local parent → Paynow / ZIPIT school-code / EcoCash till** — deferred for MVP local-payer depth; still informs which destination types schools already trust.

**Currency note:** Prefer freezing **USD** Obligation + destination for the UK→ZW wedge. ZiG/ZWG paths exist but add FX/recon noise; keep as later enum if a pilot school insists.

---

## 2. What MTOs can already hit — and gaps Senda must document

### Public payout coverage (ZW receive)

| Partner class | Bank USD | EcoCash / mobile | Cash / agent | School merchant / bill-pay API |
| --- | --- | --- | --- | --- |
| **WorldRemit** | Yes — any ZW bank; Steward ~1 WD; others ≤3 WD; needs bank, branch, **nostro FCA** # | Yes — EcoCash (instant) | Yes — Steward, Mukuru, HelloPaisa, CBZ, ZB, etc. | **Not published** as school-biller instruct |
| **Remitly** | Bank deposit listed for ZW | EcoCash USD wallet | Yes (Mukuru / HelloPaisa-class) | **Not published** |
| **Mukuru** | Bank / partners in network; strong cash + wallet footprint | EcoCash partnership; Mukuru Wallet | Core strength (booths) | Mukuru Pay = bills (e.g. DStv) at booths; **ZW school-fee purpose API not evidenced publicly** |
| **Western Union / MoneyGram / Sasai** | Corridor-dependent | EcoCash partner pages list them | Yes | Wallet credit, not school Obligation layer |
| **PayAngel-class** | Strong on **other** African corridors (bank / MoMo / D2MR in GH etc.) | — | — | **Live FAQ destinations exclude Zimbabwe** (as of research date). Treat as **later / non-pilot** demand unless founder confirms ZW roadmap |
| **Vybe-class purpose apps** | Unknown publicly | Unknown | — | **Founder outreach required** |

### Intersection that matters for Connect instructions

For `mto_settles`, the destination Senda freezes must be one the **partner’s payout network can actually credit**.

| Destination type | School accepts? | Typical MTO can hit? | Pilot guidance |
| --- | --- | --- | --- |
| School **USD bank (nostro/FCA)** | Yes (primary) | Yes (WR/Remitly-class) | **Default #1** SettleDestination |
| School-owned **EcoCash** (merchant or verified institutional wallet) | Yes (common) | Yes (wallet credit) | **Default #2** — verify ownership in KYB; prefer merchant till over personal staff phone |
| Paynow merchant / integration ID | Yes (local/card) | **No** as remittance payout target | Document as school **local** rail only; do not put on Connect instruct for MTOs |
| ZIPIT merchant / bank school-code | Yes (local) | **No** for UK remittance API | Enum / ops note; not day-one Connect destination |
| Relative’s EcoCash / cash pickup | Common workaround | Yes | **Reject as SettleDestination** — fails purpose proof |

### Gaps Senda must put in partner instructions (Connect)

1. **Destination capability matrix per partner** — which of `{bank_usd, ecocash}` this partner_id can settle; refuse instructions if school only has a type they cannot hit.  
2. **Reference field contract** — many remittance bank credits surface the **partner’s** transfer id (e.g. WorldRemit’s 8-digit ref on the statement), **not** a free-form bursar string. Senda’s `customer_reference` may need dual recon: partner confirm payload (authoritative) + optional statement match. Document this explicitly so schools don’t expect the Senda ref to always appear verbatim on the bank line.  
3. **Name matching** — bank payouts require recipient legal name ≈ account name; KYB must capture the **exact account title**, not marketing school name.  
4. **Business vs personal accounts** — WorldRemit: Steward savings/checking only; other banks allow business accounts. Prefer business/FCA for schools.  
5. **Limits & speed** — EcoCash often instant but amount-capped; bank 1–3 WD. Instructions should carry expected settle window for ops SLA.  
6. **EcoCash Diaspora / Paynow bypass** — partners still care about Obligation accuracy + proof for **their** flow; Senda is not the clearing house for EcoCash’s own merchant pays.

**Founder outreach required (flagged):** Confirm with Mukuru / Remitly / WorldRemit whether **institutional / business** bank and EcoCash merchant tills are allowed on UK→ZW API (vs person-to-person only), and whether a custom remittance reference can be passed through.

---

## 3. Stack options for Connect + Biller + dogfood

### What the stack must carry in the first wedge

- One relational domain: Institution → SettleDestination → Beneficiary → Link → Obligation → Attempt → Instruction → Confirmation → Proof  
- **Connect:** partner API key, validate / instruct / confirm, idempotency, sandbox  
- **Biller:** school login, CSV students, fee templates → Obligations, payments list, proof download (beside ERP; no NN)  
- **Dogfood:** thin UI to run the same loop without a live partner  
- Proof artifact storage (JSON first; PDF optional)  
- Manual KYB + destination verify; ZW live only; other corridors enums-only  
- Fetch-at-pay Obligation status; webhooks and ERP pull are **later**

### Scored options

Scoring 1–5 (higher = better fit). Weights: ship speed for 3 surfaces (25%), domain/recon integrity (20%), Connect API fitness (15%), auth/multi-tenant (10%), hosting/ops simplicity (10%), proof/file story (10%), hiring/founder familiarity (10%).

| Option | Speed (3 surfaces) | Recon / relational | Connect API | Auth / tenancy | Host / ops | Proof / files | Familiarity | **Weighted** | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **A. Next.js + TS + Postgres** (proposed) | 5 | 5 | 5 | 4 | 5 | 4 | 4 | **4.7** | App Router: Route Handlers = Connect; server components = Biller + dogfood; one deployable. Prisma/Drizzle + Postgres for exact recon. |
| **B. NestJS/Express API + separate React/Next UI** | 3 | 5 | 5 | 4 | 3 | 4 | 3 | **3.9** | Cleaner service boundary later; slower for one founder/small team shipping dogfood + Biller now. |
| **C. Rails or Django monolith** | 4 | 5 | 4 | 4 | 4 | 4 | 2 | **4.0** | Excellent admin/Biller; Connect JSON APIs fine; weaker default TypeScript partner-doc ergonomics unless API-only. |
| **D. Supabase/Firebase + thin Next** | 4 | 3 | 2 | 3 | 5 | 4 | 3 | **3.4** | Fast CRUD; partner API keys, idempotent instruct, and strict recon workflows fight the BaaS grain. |
| **E. Remix / SvelteKit + Postgres** | 4 | 5 | 4 | 4 | 4 | 4 | 2 | **4.0** | Capable; smaller ecosystem for B2B API+docs templates vs Next. |
| **F. Python FastAPI + React SPA** | 3 | 5 | 5 | 3 | 3 | 4 | 3 | **3.7** | Strong APIs; two runtimes and CORS for dogfood/Biller slows M1–M5. |

### Supporting choices (same lock as #9)

| Concern | Recommendation | Why |
| --- | --- | --- |
| **Hosting** | Single Node app on Fly.io or Railway (or Vercel + managed Postgres) | One process for Connect + Biller + dogfood; avoid split frontend/backend until a second team appears |
| **DB** | Managed Postgres (Neon / RDS / provider default) | Source of truth for Obligations and recon; migrations from day one |
| **ORM** | Drizzle or Prisma | Typed schema matching domain objects; pick one and stick |
| **Identity** | Auth.js (Credentials + magic link) or Clerk for school/ops users; **partner API keys** for Connect (not end-user OAuth) | Matches surfaces; partners ≠ school logins |
| **Object storage** | S3-compatible (R2 / S3) for proof JSON/PDF and KYB uploads | Keep blobs out of Postgres |
| **Jobs** | In-process + later queue (Inngest / Trigger / BullMQ) when webhooks grow | Don’t introduce Kafka day one |
| **PDF proofs** | Optional HTML→PDF later; ship **proof JSON** first | Exit criteria allow JSON |
| **ERP / ZivoFees / Makronexus** | Out of process for 90 days; HTTP client stubs only if a pilot forces it | Freshness = templates + Biller exceptions |

**Anti-fit:** Firebase-only, microservice mesh, event sourcing, or building a payout adaptor (`senda_settles`) into the stack.

---

## 4. What must ship in 90 days vs later

Aligned to work-plan M1–M6 and product-how-it-works. **Must** = needed to lock wedge proof with 5–10 ZW schools + dogfood/sandbox partner. **Later** = after first proven corridor loop.

### Must ship (~90 days)

1. **Domain + migrations** for core objects; country `ZW` live; other corridors enums-only.  
2. **Ops KYB** (manual OK) + **SettleDestination verify** for **bank_usd** and **ecocash**.  
3. Student **CSV → Beneficiaries / open Links**; fee plan → bulk **Obligations** (grade/class templates + exceptions in Biller).  
4. Attempt lifecycle: validate → **instructions** + unique `customer_reference` + **frozen destination snapshot** (idempotent).  
5. Confirmation ingest (`manual_ops` / `partner_api` / `school_mark`) + recon (ref + amount + currency) → `proven` | `needs_reconcile`.  
6. **Proof JSON** (+ download in Biller); object store wired.  
7. **Connect API MVP** + partner API key + sandbox docs (institutions, links, validate, instructions, confirmations, attempts/proofs).  
8. **Biller thin UI:** login, students/CSV, obligations hygiene, payments list, proof, settle-destination settings.  
9. **Dogfood UI:** run instruct → confirm → proof without a live MTO.  
10. Partner **destination capability** flags + clear error when school destination ∉ partner reach.  
11. Pilot ops hygiene: stale Obligation flags; weekly check; remove unmaintained schools from live Connect.

### Explicitly later (not 90-day blockers)

- Live **ERP / ZivoFees / Makronexus pull** or SIS connectors  
- Production **webhooks** maturity (`attempt.proven`, etc.) beyond a thin stub  
- Polished **PDF** proofs  
- Paynow / ZIPIT / InnBucks as Connect instruct destinations  
- `senda_settles` / EcoCash or Flutterwave as Senda’s payout engine  
- Local ZW payer product depth; Nigeria live KYB  
- Neural net matching; open marketplace; multi-PSP routing  
- Pricing / Connect fee billing (instrument usage only)

---

## 5. Recommendations (explicit #9 and #10)

### #9 — Tech stack — **LOCKED** (2026-11-18)

**Locked text:** **Next.js (App Router) + TypeScript + Postgres**, with:

- Connect as Route Handlers / versioned `/v1` API  
- Biller + dogfood as the same app’s authenticated UI  
- Managed Postgres + typed ORM (Drizzle or Prisma — choose at scaffold)  
- Auth.js or Clerk for school/ops; opaque **partner API keys** for Connect  
- S3-compatible object store for proofs and KYB files  
- Biller **beside** school systems (templates + exceptions; **no** ERP day one; **no** NN day one)

**Confidence: High (0.85).** Best score for one small team shipping Connect + Biller + dogfood on a recon-heavy relational domain; matches the already-proposed default in preferences. Residual risk is founder preference for Python/Rails — product fit still lands on a Postgres monolith either way; Next+TS wins mainly on single-runtime speed and partner-facing TypeScript contracts.

### #10 — ZW settle methods — **PROPOSED** (pending founder lock)

**Research recommendation:** Lock pilot SettleDestination types to **both**:

1. **`bank_usd`** — school nostro/FCA (or equivalent USD business account); capture bank, branch, account title, account number, optional SWIFT. **Default preferred** for term-size fees and MTO bank deposit rails.  
2. **`ecocash`** — school-owned EcoCash (prefer merchant/institutional wallet); capture MSISDN, wallet currency (USD preferred), ownership proof in KYB.

**Also lock (policy, not destination types):**

- **Out of pilot Connect destinations:** cash pickup, personal relative wallets, Paynow merchant IDs, ZIPIT merchant/school codes (keep as **documented school-local rails** / future enums only).  
- **Instructions must be partner-capability-aware** — do not instruct an MTO to a destination type their ZW payout network cannot hit.  
- **Currency:** USD Obligations for UK→ZW wedge; ZiG only if a named pilot school forces it.

**Confidence: Medium-High (0.75).** School-side acceptance of bank + EcoCash is well evidenced. MTO **institutional** payout (vs P2P) and **custom reference pass-through** are only partially evidenced in public docs — **founder design-partner calls** should confirm before the first live settle, but should not delay locking the two destination types in the data model.

---

## 6. Method & limits

- Sources: EcoCash partner/news pages; Paynow merchant/developer docs; Zimswitch/ZIPIT public materials; WorldRemit/Remitly/Mukuru public corridor pages; school payment pages; Makronexus product copy; PayAngel FAQ/country lists; Senda product-how-it-works, preferences, research-plan, work plan.  
- **No partner interviews** were conducted. Items marked outreach-required should be closed in design-partner conversations parallel to build.  
- Sibling workstreams A/B/D may refine MTO appetite and school KYB friction; they should not reopen #9/#10 unless they falsify bank/EcoCash reach or show Next+Postgres blocking Connect.

---

*End workstream C. Feed into coordinator `docs/research/lock-brief.md` after A–D.*
