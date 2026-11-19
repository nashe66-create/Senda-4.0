import { z } from "zod";
import { requirePartner } from "@/lib/auth";
import { confirmPayment } from "@/lib/connect";
import { jsonOk, handleRouteError, jsonError } from "@/lib/api";

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
