# Kuva Cash feedback — ex-employee conversation (2026-11-18)

**Source:** Conversation with someone who previously worked at Kuva Cash, whose payment rail served CK Cash in Zimbabwe.
**Status:** Founder notes from a single conversation. Not partner research; treat as directional signal, not validation.
**Relates to:** `demand-mto-diaspora.md` (killer objections), `wedge-comparison.md` (MTO appetite, regulatory load), Decision #10 (ZW settle methods), school-received confirmation research.

---

## What they raised

### 1. Cash preference at the dealer / school level

Most dealers in Zimbabwe would want **cash**. Senda facilitates infrastructure where someone abroad pays a biller in the UK directly, but that biller (or the local side receiving funds) is also going to want cash. The digital-to-digital loop does not automatically solve the last-mile cash need — schools and local counterparties may still expect physical cash, which reintroduces the cousin/agent handoff Senda is trying to remove.

**Implication:** The proof layer helps when funds arrive digitally, but if the school's operational reality is cash-in-hand, Senda's Obligation → Instruction → Confirmation → Proof chain may sit one step removed from how the bursar actually books the payment. Worth probing with 1–2 ZW private-school bursars (already on the founder-interview list in demand research §7).

### 2. Regulation — who gets regulated?

Once you start dealing with payments that look P2P, the regulatory treatment differs from classic remittance. Open question from the conversation: **does Senda get regulated, or does the MTO?** If Senda is not moving money (`mto_settles` doctrine), Senda is likely positioned as an introducer / tech provider / instruction-and-proof layer rather than a licensed money transmitter — but that boundary needs a proper legal read before building around it, especially as the product deepens into recon, dispute handling, and any float-adjacent features.

**Action:** Commission a UK/ZW regulatory scoping note (FCA perimeter for UK-side activity; RBZ/IPEC exposure on the ZW side) before any partner integration goes live. This is adjacent to but distinct from the IPEC AML load already flagged for funeral/policies in the wedge comparison.

### 3. Cost math vs the cousin path

Mukuru (or any MTO) would now pay Senda to facilitate the school payment, which makes the bill payment more expensive to the diaspora sender compared to simply sending cash to a cousin to pay the bill directly. The cousin path is cheap, familiar, and requires no new integration — its failure mode is loss of proof and diversion risk, not price.

**Implication:** Senda only wins where the cousin path fails — lost money, no receipt, school can't confirm the student is enrolled. This is exactly what the school-received confirmation research (`school-received-confirmation.md`) attacks. If that proof is genuinely better than a WhatsApp screenshot to a diaspora parent who has been burned before, the fee may be worth it. If not, Senda is paying for infrastructure nobody asked for.

### 4. Is this even a problem MTOs care about?

MTOs make enough money from P2P remittance. Would there be enough margin for them to bother adding bill payments — specifically school fees — to their platforms? MTOs are Senda's customers in the Connect model, so MTO indifference is an existential risk, not a nice-to-have objection.

**What the existing research says:**

- MTO willingness to integrate Connect is rated **low confidence** in `demand-mto-diaspora.md` §6 — zero partner interviews behind it.
- Mukuru already runs biller collections (DStv, utilities, vouchers) with local and international settlement — the biller-appetite muscle exists; school fees specifically lack the dues-and-proof layer.
- Competitive pressure is real: Topa, ClicknShare, and EcoCash Diaspora Wallet are already selling "pay school directly" to the same UK senders. An MTO that ignores purpose SKUs risks losing that slice to apps that don't need their rail.
- The pitch in the docs: keep your licence, float, and FX — buy allowlisted dues, refs, and recon proof so the school SKU ships without onboarding every bursar into your ops. Framed as a thin-margin add-on, not a new business line.

**Open question (unchanged from research):** will any named MTO actually pay for that versus building in-house or listing billers themselves?

### 5. Senda's edge — not a directory

Senda does not want to be a directory of billers. It wants to be the infrastructure behind the payments. The edge over Mukuru (who already facilitates some bills) is:

- **The three-way recon loop.** Mukuru can list a school and take an account number, but when the payment doesn't match, the school says it never arrived, or the cousin diverted it — their ops cost explodes and the support queue fills with disputes they can't resolve. Senda's value is the system that records: this obligation was validated, this instruction went out with this ref, this confirmation came back, here's the proof — and when it doesn't line up, routes to `needs_reconcile` instead of a shrug.
- **Network density across MTOs.** If Topa or ClicknShare each build their own school graph, every school onboards five times. Senda's bet is that schools and MTOs both benefit from one allowlisted layer they don't each have to maintain — which only works if enough partners join that leaving means rebuilding. That's a flywheel, not a feature.

### 6. Can EcoCash do exactly what Senda is trying to do?

**Yes — and they already have most of the pieces.** EcoCash Diaspora Wallet (UK launch ~July 2026) funds via card, pays school fees with real-time confirmation, and schools already hold EcoCash tills as a settle destination. They do not need a partner to move money because they *are* the rail.

What EcoCash does **not** have is the partner-agnostic layer. Everything runs through their wallet, their KYB, their confirmation semantics. If you are Mukuru, you cannot plug EcoCash into your app as infrastructure without handing your sender relationship to them.

Senda's pitch to an MTO is: you keep the money and the customer — we just make the school side provable. EcoCash cannot make that offer, because adopting them means becoming their customer.

**Honest framing:** EcoCash is simultaneously (a) the threat that proves demand exists, and (b) the competitor that can outspend Senda on distribution. Senda's defence is not that EcoCash can't do it — it's that EcoCash won't do it for anyone but themselves.

---

## Open items from this conversation

| ID | Item | Owner |
| --- | --- | --- |
| K1 | Regulatory scoping: FCA perimeter (UK) + RBZ/IPEC (ZW) for an instruction-and-proof layer that does not move money | Founder + legal |
| K2 | Bursar interviews: do ZW private schools actually want/expect cash at receipt, or is digital settle already normal? | Founder outreach |
| K3 | MTO interviews: would Mukuru-class partners pay for dues+proof, or is the cousin-path cost gap fatal? | Founder outreach (priority — lowest-confidence item in demand research) |
| K4 | Quantify the cousin-path failure rate: how often do diaspora school payments get diverted or unprovable? | Research / diaspora parent interviews |
| K5 | Watch EcoCash Diaspora Wallet school-fee adoption in UK→ZW as the leading indicator of whether MTOs must respond | Ongoing competitive intel |

---

## Bottom line

The Kuva Cash conversation did not kill the wedge — it sharpened the two things Senda must prove before any MTO will pay: (1) that the cousin path fails often enough and expensively enough that proof is worth a fee, and (2) that Senda's recon-and-density layer is something no single vertical player (EcoCash) or single MTO (Mukuru) will build for everyone else. Both are unproven. Both are now explicitly on the founder-interview and research list.
