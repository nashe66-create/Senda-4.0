import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  confirmPayment,
  instructPayment,
  validatePayment,
} from "@/lib/connect";
import { jsonOk, handleRouteError, jsonError } from "@/lib/api";
import { SettleDestinationType } from "@prisma/client";

/**
 * Dogfood / test loop: validate → instruct → test confirmation → proof.
 * Uses the demo remittance partner fixture in DB; no live partner settle.
 */
const bodySchema = z.object({
  link_code: z.string().min(1),
  obligation_id: z.string().min(1),
  destination_type: z.enum(["bank_usd", "ecocash"]).default("bank_usd"),
  amount: z.union([z.string(), z.number()]).optional(),
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());

    const partner = await prisma.partner.findUnique({
      where: { partnerId: "partner_mukuru_sbx" },
    });
    if (!partner) {
      return jsonError(
        "partner_missing",
        "Sandbox partner not seeded. Run: npm run db:seed",
        500,
      );
    }

    const validated = await validatePayment({
      partner,
      linkCode: body.link_code,
      obligationId: body.obligation_id,
      amount: body.amount,
      destinationType: body.destination_type as SettleDestinationType,
    });

    const amount = body.amount ?? validated.obligation.amount;
    const idempotencyKey = `dogfood_${body.link_code}_${body.obligation_id}_${Date.now()}`;

    const instructed = await instructPayment({
      partner,
      linkCode: body.link_code,
      obligationId: body.obligation_id,
      amount,
      idempotencyKey,
      destinationType: body.destination_type as SettleDestinationType,
      payerHint: "dogfood_ui",
    });

    const confirmed = await confirmPayment({
      partner,
      attemptId: instructed.attempt_id,
      customerReference: instructed.customer_reference,
      amount: instructed.amount,
      currency: instructed.currency,
      partnerPaymentId: `DOGFOOD-${Date.now()}`,
      settledAt: new Date().toISOString(),
      source: "dogfood_stub",
    });

    const proof = await prisma.proof.findUnique({
      where: { attemptId: instructed.attempt_id },
    });

    const { _internal, ...validatePublic } = validated;
    void _internal;

    return jsonOk({
      loop: ["validate", "instruct", "confirm", "proof"],
      validate: validatePublic,
      instruct: instructed,
      confirm: confirmed,
      proof: proof
        ? {
            id: proof.id,
            storage_key: proof.storageKey,
            payload: proof.payload,
          }
        : null,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
