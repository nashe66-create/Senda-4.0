import { z } from "zod";
import { requirePartner } from "@/lib/auth";
import { validatePayment } from "@/lib/connect";
import { jsonOk, handleRouteError, jsonError } from "@/lib/api";
import { SettleDestinationType } from "@prisma/client";

const bodySchema = z.object({
  link_code: z.string().min(1),
  obligation_id: z.string().min(1),
  amount: z.union([z.string(), z.number()]).optional(),
  destination_type: z
    .enum(["bank_usd", "ecocash", "cash_pickup", "paynow", "zipit"])
    .optional(),
  payer_hint: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const auth = await requirePartner(request);
    if (!auth.ok) {
      return jsonError(auth.error.code, auth.error.message, auth.status, {
        safe_to_retry: false,
      });
    }

    const body = bodySchema.parse(await request.json());

    // Explicit reject of non-Connect destination types at the edge
    if (
      body.destination_type &&
      body.destination_type !== "bank_usd" &&
      body.destination_type !== "ecocash"
    ) {
      return jsonError(
        "destination_rejected",
        `Destination type '${body.destination_type}' is not a Connect settle destination (allowed: bank_usd, school-owned ecocash)`,
        400,
      );
    }

    const result = await validatePayment({
      partner: auth.partner,
      linkCode: body.link_code,
      obligationId: body.obligation_id,
      amount: body.amount,
      destinationType: body.destination_type as
        | SettleDestinationType
        | undefined,
    });

    const { _internal, ...publicResult } = result;
    void _internal;
    return jsonOk(publicResult);
  } catch (err) {
    return handleRouteError(err);
  }
}
