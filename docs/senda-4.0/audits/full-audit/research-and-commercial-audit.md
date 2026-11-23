# Senda 4.0 research and commercial audit

**Audit date:** 23 November 2026  
**Scope:** Repository audit baseline plus every `docs/senda-4.0/` research, product, context, work-plan, and testing document, including branch-only `product/onboarding-dues-scenarios.md` and `research/kuva-cash-feedback.md`. Implementation cross-check: `apps/web`, Prisma schema, Connect/auth/proof code, API routes, seed and test validator.  
**Evidence cutoff:** Public and internal sources dated through 18 November 2026; access/review performed 23 November 2026.  
**Rule:** “Commercial decision” means how the evidence may be used, not a finding that customers have agreed.

## Executive assessment

The available evidence supports a narrow **discovery thesis**, not a validated market:

1. UK→Zimbabwe is a material recorded remittance corridor.
2. Education is a plausible historical/present subject for diaspora discussion.
3. Zimbabwe private schools commonly publish or operate some combination of bank, EcoCash, Paynow, ZIPIT and cash reconciliation workflows.
4. The proposed validate→instruct→confirm→proof chain is technically coherent and implemented as a sandbox.

It does **not** establish UK→Zimbabwe school-fee TAM, MTO willingness to pay, named MTO capability, diaspora payer willingness to pay for proof, school willingness to maintain obligations, biller density, or independent receipt/allocation evidence. The pack contains no named customer relationship, interview, letter of intent, live partner integration, school commitment, settlement statement or transaction allocation record.

The main commercial question is narrower than “is the idea good?”: **Can Senda recruit enough willing MTOs and schools, preserve references through actual settlement, reconcile exceptions economically, and obtain credit plus allocation evidence?** The current implementation answers the software mechanics only.

## Classification and evidence rules

- **Verified fact:** supported by repository state or a reproducible primary/official source.
- **External claim:** assertion attributed to a public vendor, press source or academic source.
- **Internal assumption:** asserted inside Senda documents without external or customer evidence.
- **Hypothesis:** a falsifiable commercial or operational prediction requiring interviews or a pilot.
- **Recommendation:** an action proposed by this audit.
- Confidence concerns the narrow claim, not the broader market.
- Public marketing is evidence of a vendor’s proposition, not adoption, transaction volume or reliability.

## Full claim, source and commercial register

| ID / class | Claim | Publisher / source URL | Publication date | Access date | Evidence | Confidence | Validity | Commercial decision |
|---|---|---|---|---|---|---|---|---|
| V1 | 2024 UK→ZW remittance flow is 586.6m USD (27.3%); H1 2025 is 313.0m USD (29%). | Embassy of Zimbabwe DC, *Diaspora Remittances by Corridor*; https://zimembassydc.org/the-zimbabwean-diaspora/ | Not stated; tables cover 2024/H1 2025 | 23 Nov 2026 | Official-style corridor table reproduced from a government source page and attributed to RBZ; exact historical periods stated. | High for table totals; low for TAM inference | **Verified aggregate fact, not school-fee or Senda market evidence** | Use only as corridor-context support. Do not multiply by education share or call it Senda TAM. |
| V2 | ONS Census 2021 identifies about 122,000 Zimbabwe-born residents in England and Wales. | ONS, Census 2021; https://www.ons.gov.uk/census | Census 2021 (page date not stated) | 23 Nov 2026 | Narrow birthplace/residence count. | High for geography/count; low for payer inference | **Verified population fact** | Use as context only. It does not identify parents, remitters or fee payers. |
| E1 | Education/school fees is about 19.23% of reported purposes in a UK-Zimbabwe diaspora survey. | Mbiba & Mupfumira, *World Development Perspectives* 27 (2022), DOI/PMC; https://pmc.ncbi.nlm.nih.gov/articles/PMC9359510/ | 8 Aug 2022 | 23 Nov 2026 | Respondent-purpose shares in a historical COVID-era survey. | Medium for the historical sample; low for 2026 behavior | **External claim / historic purpose signal** | Use to justify interviews, not current volume or TAM. |
| E2 | RPW average total cost for a 120 GBP UK→ZW send is about 5.04% for the Q3 2025 snapshot. | World Bank, Remittance Prices Worldwide; https://remittanceprices.worldbank.org/corridor/United-Kingdom/Zimbabwe | Collection 8–26 Aug 2025 | 23 Nov 2026 | Corridor/provider dated price snapshot. | High for the snapshot; none for Senda willingness-to-pay | **Verified dated market-price fact** | Refresh before pricing claims. It is not Senda’s revenue pool or proof senders pay for attribution. |
| E3 | ZivoFees, Makronexus, SchoolKeeper, CAIMS and ZimSchool advertise term templates, bulk fees, roster import, statements or payment workflows. | Vendor pages linked in `research/supply-zw-schools.md`; access: 18 Nov 2026 | Vendor publication dates mostly unstated | 23 Nov 2026 | Multiple vendor product pages describe similar workflows. | Medium-high for products offered; low for prevalence/adoption | **External vendor claims** | Use as an onboarding analogue. Do not claim installed base or current paid adoption. |
| E4 | Advertised ZW school-software prices include ZivoFees 15–55 USD/month, Makronexus private plans about 99 USD/month, and similar CAIMS/ZimSchool figures. | `research/supply-zw-schools.md` vendor sources | Mostly unstated/dynamic | 23 Nov 2026 | Internal quotations of marketing prices. | Low-medium; list prices may change | **External marketing claim** | Do not use as Senda’s WTP or competitor revenue evidence. Obtain signed contract terms. |
| E5 | Private schools may receive USD bank, EcoCash, Paynow, ZIPIT or cash. | School pages, vendor pages and checklists in `research/supply-zw-schools.md` | Mostly unstated | 23 Nov 2026 | Individual schools and service pages publish varied channels. | Medium for examples; low for population pattern | **External examples** | Verify each pilot school’s exact account/till and partner reach. |
| E6 | Bank and EcoCash merchant onboarding can require entity, beneficial-owner, board/signatory, address and mandate evidence. | EcoCash Merchants; ZB/NMB account checklists; `supply-zw-schools.md` | Mostly unstated/dynamic | 23 Nov 2026 | Public checklist evidence. | Medium for the listed requirements; low for median time/refusal | **Verified public onboarding examples** | Budget assisted KYB and measure refusal/time for the actual 5–10 schools. |
| E7 | WorldRemit, Remitly, Mukuru and Western Union advertise ZW bank/wallet/cash delivery. | Public partner product pages linked in `demand-mto-diaspora.md` | Dynamic | 23 Nov 2026 | Publicly advertised receive methods. | Medium for public offers; low for school/business account eligibility | **External claims** | Ask named partner operations owners for written capability. Do not represent an MTO as committed or integrated. |
| E8 | Mukuru advertises bill collections and local/international settlement. | Mukuru, Bill Payment; https://www.mukuru.com/zw/services/collections/bill-payment/ | Dynamic; not stated | 23 Nov 2026 | Vendor product page. | Medium for the claim; none for school-fee SKU or WTP | **External marketing claim** | Treat as a category-design candidate, not a commercial relationship. |
| E9 | EcoCash Diaspora Wallet is reported to fund school-fee/merchant payments from UK/other diaspora markets. | Business Times/EcoCash coverage and `wedge-comparison.md` | Around Jul 2026 | 23 Nov 2026 | Secondary reporting plus vendor/partner context. | Medium for existence; low for coverage/adoption | **External report of competitor capability** | Live-test current terms. Treat EcoCash as a bypass and as a possible settlement destination. |
| E10 | Topa/ClicknPay/ClicknShare market direct school-fee/receipt/settlement functionality. | Zimbabwe Advocate and vendor pages linked in `demand-mto-diaspora.md` | Topa article 22 Oct 2026; others mostly unstated | 23 Nov 2026 | Public competitive claims and one press report. | Medium for proposition; low for live coverage/volume/reliability | **External competitor claims** | Compare in interviews and demos. Do not use competitor marketing to infer market size or Senda moat. |
| E11 | Bharat Connect demonstrates fetch/validate/pay, unique identifiers, bill references and net settlement in India. | NBBL/NPCI Procedural Guidelines v6; RBI; https://www.bharat-connect.com/education/ | Guidelines Nov 2025; RBI expansion 16 Sep 2019 | 23 Nov 2026 | Primary operator/regulator process documentation. | High for the Indian process; low for Zimbabwe transferability | **Primary external process evidence** | Borrow fetch/ref/recon patterns only. Do not copy settlement guarantees or clearing status. |
| E12 | A 2024 Birmingham doctoral study describes recipient misuse in 18.8% of remittance stoppages among respondents. | Ntata thesis, summarized in `cousin-path-metrics.md` | 2024 | 23 Nov 2026 | Malawi migrant study summarized internally; full tables not independently verified here. | Low for Zimbabwe/school-fee extrapolation | **Secondary/summarized external claim** | Do not convert to a Zimbabwe school-fee diversion rate. Measure it directly. |
| E13 | 35–75% of remittance flows in developing countries may be informal. | Freund & Spatafora/World Bank-related sources summarized in `cousin-path-metrics.md` | Not captured consistently | 23 Nov 2026 | Broad cross-country literature, inconsistent date/definition. | Low for a Zimbabwe-specific statistic | **External literature range** | Remove from customer pitches until a primary, denominator-consistent source is obtained. |
| E14 | A Kuva Cash ex-employee reported dealer/school cash preference and questioned regulatory treatment. | `branch-only docs/senda-4.0/research/kuva-cash-feedback.md` | Conversation 18 Nov 2026 | 23 Nov 2026 | Founder note from one anonymous former employee. | Low; single directional anecdote | **Internal note about an external conversation** | Use as interview hypothesis. Do not describe it as market research or partner validation. |
| I1 | MTOs need Senda as a thin dues/reference/reconciliation layer. | `demand-mto-diaspora.md`, `lock-brief.md`, Kuva feedback | 18 Nov 2026 | 23 Nov 2026 | Internal synthesis, no partner interviews. | Low | **Hypothesis / internally held assumption** | Test with a named MTO product and operations owner. |
| I2 | Schools will maintain term templates, exceptions and rare payout changes in a Biller. | `onboarding-dues-scenarios.md`, `supply-zw-schools.md` | 18 Nov 2026 | 23 Nov 2026 | Public pattern plus one design brief. | Medium for analogy; low for willingness | **Internal product hypothesis** | Test against actual bursar workflows and real fee registers. |
| I3 | Ops-assisted onboarding is the right first 5–10-school mode. | Branch-only onboarding brief and supply research | 18 Nov 2026 | 23 Nov 2026 | Strategic recommendation. | Medium as a process choice; low as market WTP | **Internal operating assumption** | Use as a pilot operating mode, not a proven scalability answer. |
| I4 | USD business bank and school-owned EcoCash are partner-reachable school destinations. | `rails-and-stack.md`, `lock-brief.md` | 18 Nov 2026 | 23 Nov 2026 | School examples plus public MTO payout pages. | Medium on school acceptance; low on institutional MTO reach/reference pass-through | **Hypothesis pending named partner feasibility** | Gate any live pilot on written partner capability. |
| I5 | “Confirmed”/`proven` means the right school received and allocated funds. | Cross-checked Senda product copy versus implementation | Repository state | 23 Nov 2026 | Implementation only matches instruction and partner confirmation fields. | High that current semantics are a match; no receipt evidence | **Implemented claim is overstated in some copy** | Rename externally as “partner-confirmed, matched reference/amount/currency.” Add receipt and allocation states. |
| I6 | Senda’s no-funds-handling model removes UK/Zimbabwe regulatory obligations. | `pivot.md`, `how-it-works.md`, `work-plan.md`, Kuva feedback | 18 Nov 2026 | 23 Nov 2026 | Product legal assumption. | Low without counsel | **Unsupported legal assumption** | Commission written UK and Zimbabwe analysis before live funds. |
| I7 | A shared partner-neutral network creates switching density and defensibility. | `kuva-cash-feedback.md`, pivot/research synthesis | 18 Nov 2026 | 23 Nov 2026 | Network-effect hypothesis. | Low | **Commercial hypothesis** | Test whether schools reduce maintenance and MTOs reduce onboarding enough to prefer a shared layer. |
| I8 | School density of 5–10 institutions proves the initial loop. | `work-plan.md`, `pilot-runbook.md`, onboarding brief | 18 Nov 2026 | 23 Nov 2026 | Internal exit criterion. | Low; not a sample-based market threshold | **Internal pilot assumption** | Treat as a bounded operating goal, not product-market fit or a density minimum. |
| V3 | The repository implements `validate -> instruct -> confirm -> proof` for seeded records. | Direct implementation: `apps/web/src/lib/connect.ts`, routes and Prisma | Repository state 23 Nov 2026 | 23 Nov 2026 | Reproducible source and API shape. | High | **Verified implementation fact** | Use for sandbox capability statements only. |
| V4 | Positive proof requires a partner-confirmed reference, amount and currency match, not bank/wallet credit evidence. | Direct implementation and proof helper | Repository state 23 Nov 2026 | 23 Nov 2026 | `connect.ts` and `proofs.ts` create proof on recon match. | High | **Verified implementation fact** | External copy must say matched partner attestation. |
| V5 | Proof JSON is currently local filesystem data, not durable S3-compatible storage. | `apps/web/src/lib/proofs.ts`, app README | Repository state 23 Nov 2026 | 23 Nov 2026 | Local `PROOF_STORAGE_DIR`/`./proofs` implementation. | High | **Verified implementation fact** | Do not market object storage or durable production proofs as delivered. |
| V6 | The testing pack contains 95 structured cases and the validator passes. | `testing/`; command run 23 Nov 2026 | 23 Nov 2026 | 23 Nov 2026 | Validator reported 95 cases and complete lock coverage. | High for pack structure; no runtime coverage | **Verified test-spec fact** | Convert must-have cases to executable API/integration tests before runtime claims. |

## Verified facts

1. Official corridor totals above establish only aggregate remittance relevance.
2. The 2022 survey establishes education as a reported purpose in that historical sample.
3. The implementation is a Next.js/TypeScript/Postgres/Prisma sandbox with seeded organisations, partners, pay codes and obligations.
4. It validates country, institution live/KYB state, link/obligation pairing, amount, destination eligibility and partner capability.
5. It generates instructions and freezes a destination snapshot; it checks retry keys and reference/amount/currency confirmation.
6. It writes proof JSON locally and can issue “proven” after a matching partner confirmation.
7. It does not include a live MTO bank/wallet feed, actual settlement evidence, school ledger integration or allocation confirmation.
8. The 95-case YAML pack passes its structural validator but is not an executable HTTP harness.
9. No named partner, school, payer or customer relationship is evidenced in any reviewed document.

## External claims requiring re-verification

- Current EcoCash, Topa, Mukuru, WorldRemit, Remitly, NMB, Paynow and school-vendor pages can change without a publication date.
- Public MTO pages do not prove institutional/business recipient eligibility or arbitrary payment-reference pass-through.
- Vendor school-software pages do not prove installed base, payment volume or school WTP for a second ledger.
- Competitor marketing does not prove coverage density, school transaction reliability or customer adoption.
- The 2026 press/launch claims for EcoCash and purpose apps remain secondary reporting unless operational terms are verified.
- UK community and informal-remittance estimates must not be presented as an addressable market.
- The India BBPS model is a process reference, not evidence of Zimbabwe clearing, settlement or guarantee.

## Internal assumptions

| Assumption | Assessment |
|---|---|
| MTO accepts `mto_settles` and avoids self-build | Unproven; the full-stack competitors may set higher buyer expectations. |
| School accepts ops-assisted or hybrid onboarding | Plausible, unproven with named schools. |
| School maintains term fee templates and exceptions | Plausible; local cash/Paynow/ZIPIT and parallel ledgers create drift. |
| Bank USD and/or school-owned EcoCash can receive a cross-border pay with a useful reference | Public school examples exist; named MTO capability is absent. |
| Proof is worth enough to change remittance behavior or reduce support cost | Unproven; no parent WTP or school cost baseline. |
| Shared network density creates defensibility | Unproven; no two-sided launch commitments or switching cost evidence. |
| Locks #9/#10 represent a validated market decision | They are founder/architecture locks, not customer validation. |
| A 5–10-school pilot is sufficient for a learning loop | It is a practical starting cohort, not a statistical or density threshold. |

## Hypotheses

1. **MTO need:** a partner will buy or sponsor a school SKU if it removes obligation/onboarding/reconciliation work at lower cost than self-build or a full-stack competitor.
2. **MTO willingness:** a named partner will sign and pay for Connect or fund a paid test.
3. **Reference propagation:** Senda’s customer reference can be carried through partner settlement and appear sufficiently in partner/school evidence for matching.
4. **Settlement evidence:** partner attestation can be corroborated by bank or merchant/wallet credit evidence within a useful SLA.
5. **Allocation:** the school can confirm that a credited payment is allocated to the intended student and term.
6. **School registers:** the school will maintain a current register and export or confirm term obligations.
7. **Biller density:** enough nearby schools, terms and diaspora-linked students create repeated partner volume and shared-onboarding savings.
8. **Dues freshness:** grade/class templates plus local-payment exception marking prevent material stale-bill or double-pay problems.
9. **Proof value:** matched partner confirmation plus credit/allocation evidence is meaningfully better than the cousin/WhatsApp alternative.
10. **Competitor adequacy:** EcoCash, Topa/ClicknShare or Mukuru does not already meet the MTO’s entire need sufficiently to make Senda redundant.

## Commercial adequacy assessment

### MTO need and willingness

**Need is plausible.** Public purpose-pay positioning shows that pay-school flows exist and MTO-like products seek a direct school route. A neutral layer may reduce per-biller onboarding and reconciliation if an MTO has several schools and accepts a thin Senda role.

**Willingness is unproven.** There is no interview, sandbox commercial owner, integration specification, contract, paid trial or named commitment. The branch feedback and demand pack both say the same. Ask first whether the partner wants to buy a SKU, build its own biller graph, or retain settlement and only outsource references/recon.

**Do not proceed to production spend based on public features alone.** A named MTO must confirm corridor, institutional recipients, reference fields, settlement status, dispute responsibilities, data, fees and compliance.

### Reference propagation

This is a critical kill condition. The MTO must accept and propagate `customer_reference`; bank and wallet statements must expose the same or a resolvable partner reference. The system must not assume the bursar can search for a text string that the rail never carries.

Commercially acceptable evidence can combine:

- partner transaction ID,
- instructed customer reference,
- bank/wallet credit artifact,
- exact/normalized account identifier,
- school/student/term allocation confirmation.

### School registers

The docs’ fee-template thesis is credible but not validated. The real register is the school’s operating ledger or statement feed, not a CSV created for Senda. The critical requirement is an owner, update cadence and correction mechanism for new joiners, leavers, discounts, partials, local payments and term rollovers.

### Receipt and allocation confirmation

Current positive proof is L1 partner attestation. It must be separated from:

- `partner_confirmed`: partner says it sent/paid;
- `credited`: bank/wallet/rail evidence indicates credit to the destination;
- `allocated`: school confirms student/term allocation;
- `needs_reconcile`: missing/conflicting/disputed evidence.

No recommended product claim should combine these states until evidence exists. “Received” and “allocated” require independent school or system evidence.

### Biller density

The pack does not establish enough schools or repeat transactions. Density is both count and repeatability. A useful metric is number of diaspora-linked students × terms × successful payments × supported exception rate, not just number of KYB’d schools.

Network effects are only defensible if a school is easier to onboard once for multiple MTOs and an MTO is able to see adequate school coverage. Before that proof, the proposition is an integration and reconciliation service, not a flywheel.

### Settlement evidence

No settlement statement, bank credit feed or wallet merchant report is included. The repository is sandbox evidence only. A live pilot must capture source, artifact, time, amount, currency, destination and allocation outcome. Settlement time and exceptions must be reported with denominators.

### Competitor adequacy

EcoCash is a credible end-to-end bypass and a potential direct threat. Topa/ClicknShare-type purpose gateways may already combine funding, routing and settlement. Mukuru and larger MTOs may build in-house or list billers themselves. Senda is not automatically differentiated by “directory + proof”: a competitor can provide better finality and school coverage.

Senda may be adequate only if a buyer values the neutral partner layer and Senda can produce stronger evidence at lower total support cost than those alternatives. That is not established.

## Real interview questions

### MTO product, operations and commercial owner

1. Can you pay a verified Zimbabwe school USD nostro/FCA or school-owned EcoCash merchant/institutional wallet? Show the live API/spec.
2. Can you carry a reference supplied by Senda verbatim or by a documented mapping?
3. What exact status means sent, pending, paid, credited or failed; which source is authoritative?
4. Which data appears on the bank/wallet statement or merchant report?
5. What is the average and p95 settle time, amount limit, cut-off, reversal and refund process?
6. What minimum school and transaction density makes a UK→ZW school SKU commercially useful?
7. Would you buy a dues/ref/recon layer, integrate it, build it, or list billers without it?
8. Who signs, who owns KYB, who owns customer support and who bears mismatch/false-confirm/dispute cost?
9. Would you pay per successful instruction, per settled/credited transaction, subscription or onboarding fee? Provide a price range.
10. What does a school have to be for you to accept a live pilot, and which country, currency and account types are in scope?

### Bursar / finance owner

1. Show the real term register and the last term’s inbound reconciliations.
2. How do fees arrive: bank, EcoCash, Paynow, ZIPIT, cash or another route?
3. How are student name, number and term reference carried and corrected?
4. How often are balances stale; what happens for joiners, leavers, discounts, siblings and partials?
5. How are local and cross-border payments matched today, and how long does this take?
6. Would you allow Senda to hold an open obligation beside the school ledger for one term?
7. What destination and account title can be verified as the school’s; who approves a change?
8. What documentary/electronic evidence is sufficient to say a student has been credited and allocated?
9. How many staff actions and how many days are involved in a mismatch or dispute?
10. Which proof artifact is accepted today: partner notification, statement line, SMS, merchant report or bursar signature?

### Diaspora parent / sender

1. Which route is used now; how often is it changed or combined?
2. What happens when the school says a payment did not arrive or was allocated to the wrong student?
3. What evidence is retained and shown to family?
4. How much time and support cost does diversion/non-receipt create?
5. What would payers pay for a verifiable school payment instead of the cousin/cash route?
6. What is an acceptable waiting window and refund/dispute path?
7. Would payer trust depend on partner brand, school acknowledgement or an independent bank/merchant feed?
8. Does the payer or guardian need payer identity, purpose, term or allocation details preserved?

### Competition and channel

1. Which current alternative has actually been used for a school payment in the last term?
2. What coverage, reference, receipt, settlement, fees and support did it provide?
3. Which of these does not need Senda: direct wallet, purpose app, MTO internal build or local bank biller?
4. Why would a partner carry one more integration instead of a full-stack route?

## Product-claim classification

| Product claim | Class | Treatment |
|---|---|---|
| UK→ZW private school fees is first wedge | **Internal recommendation / founder lock** | Retain for a bounded pilot, not as proven market ranking. |
| Partner moves money; Senda only validates/instructs/reconciles | **Architecture claim** | Keep pending regulatory review and contract boundaries. |
| Validate→instruct→confirm→proof | **Verified sandbox implementation** | Say it is sandbox behavior, not live settlement. |
| Partner can get payment instructions and proof | **Verified sandbox capability** | Do not claim school credit or allocation. |
| Biller sits beside school systems | **Product direction** | Consistent with current prototype; actual ERP/ledger integration remains absent. |
| Bank USD and school-owned EcoCash settle types | **Founder lock / hypothesis** | Candidate destinations; confirm institutional payout with named partner. |
| Fee templates bulk-create dues | **Unimplemented business workflow / hypothesis** | Schema exists; import/generation and actual school use are not delivered. |
| Proof is durable and downloadable | **False for current production** | JSON is local disk; object storage and retention controls are absent. |
| Biller auth is operationally secure | **Not supported** | Unsigned Base64 cookie is forgeable; no production auth claim. |
| Retry keys prevent cross-partner replay | **False for current implementation** | Key is global and not partner-scoped; security fix required. |
| Confirmed/proven means funds were received | **Overstated** | Change to matched partner attestation until credit evidence exists. |
| 95 scenarios prove runtime behavior | **False** | The validator passes; runtime/API tests do not. |

## Commercial recommendations

1. Stop calls-to-action that imply guaranteed school receipt or actual MTO partnership.
2. Use a factual test pitch: *“We are validating whether a shared school-dues/reference/reconciliation layer reduces MTO and school reconciliation work.”*
3. Make MTO interviews the first gate, not feature expansion.
4. Require two evidence streams for a live pilot: source-side settlement evidence and school-side credit/allocation evidence.
5. Require a named partner capability matrix, including bank ownership, EcoCash ownership, reference, settlement status and reversals.
6. Recruit no more than a deliberately selected 5–10-school operating sample, but do not claim it represents density.
7. Test ops-assisted onboarding cost and time; then decide whether hybrid Biller steps are affordable.
8. Build local-payment reconciliation or stale-bill controls before broad cross-border activity.
9. Rename proof states from `proven` to separate matched-attestation, credited and allocated states.
10. Add executable API tests for cross-partner isolation, concurrent retries, auth, credit evidence and recon/dispute before a live pilot.
11. Obtain written regulatory and privacy advice for actual funds/control flow before pilot settlement.
12. If no MTO buyer, no reference propagation and no school credit/allocation evidence are established, stop rather than reclassifying the demo as market validation.

## Pilot evidence threshold

**Discovery stage:** at least one MTO discussion that names feasibility constraints and at least one bursar-led register/destination review.

**Commercial feasibility stage:** written partner capability, a school named and KYB-ready, actual term register, actual destination, documented confirmation semantics and a tested price alternative.

**Live pilot stage:** real settlement, independent credit evidence, school allocation confirmation, time-to-credit, mismatch/dispute outcomes, onboarding/support cost and payer/school response.

No stage should call the preceding stage “validation” of a stronger stage.

## Audit limits

There was no interview or customer relationship evidence in the repository. External pages were not archived and many lack stable publication dates. This report does not establish MTO capability, school participation, regulatory status or market size. Implementation findings describe source state, not a production runtime. No market facts have been fabricated.
