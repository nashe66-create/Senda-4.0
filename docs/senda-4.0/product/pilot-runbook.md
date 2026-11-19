# Wedge pilot runbook — Connect + Biller end-to-end

**Audience:** Anyone walking a design partner or bursar through the sandbox loop.  
**Language:** Generic **partner** + **biller** (organisation). School fees are the first live wedge, not the product limit.  
**App:** [`apps/web`](../../../apps/web/README.md) · Guided UI: `/pilot` · Partner API: [Connect partner sandbox](./connect-partner-sandbox.md)

This runbook is the short ops path for M6. It assumes local migrate + seed (or an equivalent sandbox deploy).

---

## 1. Onboarding checklist (before the first pay)

Do these once per demo environment:

| # | Who | What | Done when |
| --- | --- | --- | --- |
| 1 | Ops | Postgres up, migrate, seed | `npm run db:seed` prints demo partner key + bursar login |
| 2 | Partner | Sandbox API key | `sk_sandbox_partner_demo` (or `SANDBOX_API_KEY`) works on Connect |
| 3 | Biller | Organisation checks + payout accounts | Biller → Destination checks shows verified org, live on Connect, at least one verified Bank USD / org EcoCash |
| 4 | Biller | People + amounts due linked | At least one open bill with a pay code (seed: Ada `HDA-ADA-001` / `obl_001`) |
| 5 | Both | Agree the confirm path | Sandbox uses **partner stub confirm** — not a live MTO webhook or bank feed |

**Demo bursar login (seed):** `bursar@heritage-demo.zw` / `pilot`  
**Demo partner key (seed):** `sk_sandbox_partner_demo`

If checklist items fail, fix seed/env before inviting a partner. Do not invent production webhooks for the pilot.

---

## 2. Happy path (one person, ~5 minutes)

### Option A — Guided UI (preferred)

1. Open **`/pilot`**.
2. Confirm the onboarding strip is green (or note what’s pending).
3. **Pick a bill** (amount due + pay code).
4. **Get pay instructions** — UI calls Connect `validate` → `instruct` with the sandbox API key and a retry key.
5. **Confirm (match)** — sandbox stub confirm with the instructed amount/currency/reference → **Confirmed** + payment proof issued.
6. **Bursar handoff** — follow the Biller link, sign in, open **Payment status**, download proof.

### Option B — Curl script

From repo root (app running on `:3000`):

```bash
bash docs/senda-4.0/product/scripts/pilot-loop.sh
# mismatch demo (defaults to Ben / obl_002 so Ada can stay confirmed):
bash docs/senda-4.0/product/scripts/pilot-loop.sh --mismatch
```

Bills must still be **open**. After a happy confirm, that amount due is no longer payable — re-seed (`npm run db:seed`) or pick another bill (`LINK_CODE` / `OBLIGATION_ID`).

Then open `/biller` (login above) and find the new payment.

### What “done” looks like

| Surface | Happy path |
| --- | --- |
| Partner / Connect | `recon_result: proven`, `proof_issued: true` |
| Biller | Payment status **Confirmed**; **Download** proof (`senda.proof.v1`) |

---

## 3. Mismatch / needs-a-check

Use when showing that a wrong confirm does **not** silently mint proof.

1. On `/pilot`, after instruct, choose **Confirm with wrong amount** (or run the script with `--mismatch`).
2. Expect **Needs a check** (`needs_reconcile`), `proof_issued: false`, recon notes explaining the gap.
3. In Biller → **Needs a check** queue and Payment status: status **Needs a check**, proof column “No proof (needs a check)”.

Same rules as the partner sandbox doc: payment reference, amount, and currency must all match.

---

## 4. Proof handoff (partner → bursar)

1. Partner keeps `attempt_id`, payment reference (`customer_reference`), and whether proof issued.
2. Bursar signs into Biller (same organisation).
3. **Payment status** lists the attempt; if confirmed, **Download** hits `GET /api/v1/biller/proofs/<attempt_id>` (session-gated).
4. Share or archive the JSON proof with the organisation’s own records — Senda does not replace their finance system.

**Label clearly in demos:** sandbox confirm is **partner attestation in the sandbox**, not “the bank told us the school received money.”

---

## 5. Exit criteria (M6 wedge loop)

Treat the pilot as green when all of the following are true in one environment:

| Criterion | How to check |
| --- | --- |
| One demo organisation live | Seed / Biller shows verified + live Connect |
| Partner sandbox key works | `/pilot` or curl validate/instruct/confirm with Bearer key |
| Open amount due → pay instructions | Instruct returns payment reference + frozen payout |
| Happy confirm → proof | Proof visible / downloadable in Biller |
| Mismatch path | Needs a check; no `senda.proof.v1` |
| No `senda_settles` | Partner (or sandbox stub) settles; Senda only validates, instructs, recon, proof |

`/dogfood` remains the one-click engineering test loop. **`/pilot` is the partner-walkable path** (sandbox API key on Connect + bursar handoff).

---

## 6. Related docs

- [Connect concepts](./connect-concepts.md) — wording map + rules  
- [Connect partner sandbox](./connect-partner-sandbox.md) — auth, retry key, confirm contract  
- [How it works](./how-it-works.md) — product loop  
- [Work plan](../work-plan.md) — M6 milestone
