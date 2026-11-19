import { z } from "zod";
import { requirePartner } from "@/lib/auth";
import { instructPayment } from "@/lib/connect";
import { jsonOk, handleRouteError, jsonError } from "@/lib/api";
import { SettleDestinationType } from "@prisma/client";

const bodySchema = z.object({
  link_code: z.string().min(1),
  obligation_id: z.string().min(1),
  amount: z.union([z.string(), z.number()]),
  idempotency_key: z.string().min(1),
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

    const result = await instructPayment({
      partner: auth.partner,
      linkCode: body.link_code,
      obligationId: body.obligation_id,
      amount: body.amount,
      idempotencyKey: body.idempotency_key,
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
