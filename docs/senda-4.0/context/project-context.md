# Senda 4.0 — project context

- **Canonical repo:** [`nashe66-create/Senda-4.0`](https://github.com/nashe66-create/Senda-4.0)
- **Docs pack:** [`docs/senda-4.0/`](../README.md)
- **First wedge (example):** UK → Zimbabwe private school fees — other billers later reuse the same pattern.
- **Doctrine:** Senda 4.0 doesn’t win by sending money cheaper — it wins by being the layer that proves the right organisation and person got paid for the right amount due.
- **Language:** Partners and billers are generic; UX prefers pay code / amount due / payment reference / confirmed · needs a check / retry key. See [connect-concepts §0](../product/connect-concepts.md).
- **#9 stack:** **LOCKED** — Next.js App Router + TypeScript + Postgres; partner API keys + school/ops auth; S3-compatible proofs; Biller beside school systems; no NN / no ERP / no PSP-core day one.
- **#10 settle:** **LOCKED** — `bank_usd` + school-owned `ecocash`; Paynow/ZIPIT school-local only; cash/relative wallets out of Connect; remittance partners settle with Senda validate→ref→confirm.
- **Reference:** [How Bharat Connect (BBPS) works, including schools](../research/bbps-india.md)
