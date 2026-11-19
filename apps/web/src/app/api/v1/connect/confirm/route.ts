import { z } from "zod";
import { requirePartner } from "@/lib/auth";
import { confirmPayment } from "@/lib/connect";
import { jsonOk, handleRouteError, jsonError } from "@/lib/api";

/**
 * Partner → Senda confirm callback.
 *
 * Request (JSON):
 * {
 *   "attempt_id": "<from instruct>",
 *   "customer_reference": "<payment reference from instruct>",
 *   "amount": "850.00",
 *   "currency": "USD",
 *   "partner_payment_id": "<partner's own settle id>",   // optional
 *   "settled_at": "2026-11-19T12:00:00.000Z"             // optional ISO-8601
 * }
 *
 * Response (stable):
 * {
 *   "attempt_id", "status", "recon_result", "recon_notes",
 *   "proof_id", "storage_key", "proof_issued",
 *   "customer_reference", "partner_payment_id", "settled_at",
 *   "instructed": { "amount", "currency" },
 *   "confirmed": { "amount", "currency" },
 *   "replayed"
 * }
 *
 * recon_result: "proven" (confirmed) | "needs_reconcile" (needs a check)
 * Mismatched payment reference, amount, or currency → needs_reconcile; no proof.
 */
const bodySchema = z.object({
  attempt_id: z.string().min(1),
  customer_reference: z.string().min(1),
  amount: z.union([z.string(), z.number()]),
  currency: z.string().min(1),
  partner_payment_id: z.string().optional(),
  settled_at: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const auth = await requirePartner(request);
    if (!auth.ok) {
      return jsonError(auth.error.code, auth.error.message, auth.status);
    }

    const body = bodySchema.parse(await request.json());

    const result = await confirmPayment({
      partner: auth.partner,
      attemptId: body.attempt_id,
      customerReference: body.customer_reference,
      amount: body.amount,
      currency: body.currency,
      partnerPaymentId: body.partner_payment_id,
      settledAt: body.settled_at,
      source: "partner_api",
    });

    return jsonOk(result);
  } catch (err) {
    return handleRouteError(err);
  }
}
