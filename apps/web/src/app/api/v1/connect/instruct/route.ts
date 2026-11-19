import { z } from "zod";
import { requirePartner } from "@/lib/auth";
import { instructPayment } from "@/lib/connect";
import { jsonOk, handleRouteError, jsonError } from "@/lib/api";
import { readRetryKey } from "@/lib/partner-request";
import { SettleDestinationType } from "@prisma/client";

const bodySchema = z.object({
  link_code: z.string().min(1),
  obligation_id: z.string().min(1),
  amount: z.union([z.string(), z.number()]),
  /** Preferred partner-facing name. */
  retry_key: z.string().min(1).optional(),
  /** System alias for retry_key (still accepted). */
  idempotency_key: z.string().min(1).optional(),
  destination_type: z.enum(["bank_usd", "ecocash"]).optional(),
  payer_hint: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const auth = await requirePartner(request);
    if (!auth.ok) {
      return jsonError(auth.error.code, auth.error.message, auth.status);
    }

    const body = bodySchema.parse(await request.json());
    const retryKey = readRetryKey(request, body);

    if (!retryKey) {
      return jsonError(
        "validation_error",
        "retry_key is required. Send the same retry key if you need to safely retry this request — you will get the same pay instructions back, not a second payment.",
        400,
      );
    }

    const result = await instructPayment({
      partner: auth.partner,
      linkCode: body.link_code,
      obligationId: body.obligation_id,
      amount: body.amount,
      idempotencyKey: retryKey,
      destinationType: body.destination_type as
        | SettleDestinationType
        | undefined,
      payerHint: body.payer_hint,
    });

    return jsonOk(result);
  } catch (err) {
    return handleRouteError(err);
  }
}
