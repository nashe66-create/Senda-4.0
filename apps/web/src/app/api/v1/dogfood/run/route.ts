import { z } from "zod";
import { Prisma } from "@prisma/client";
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
 *
 * Paths:
 * - happy: confirm with instructed amount → Confirmed + senda.proof.v1
 * - mismatch: confirm with wrong amount → Needs a check; no proof issued
 */
const bodySchema = z.object({
  link_code: z.string().min(1),
  obligation_id: z.string().min(1),
  destination_type: z.enum(["bank_usd", "ecocash"]).default("bank_usd"),
  amount: z.union([z.string(), z.number()]).optional(),
  path: z.enum(["happy", "mismatch"]).default("happy"),
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
    const idempotencyKey = `dogfood_${body.path}_${body.link_code}_${body.obligation_id}_${Date.now()}`;

    const instructed = await instructPayment({
      partner,
      linkCode: body.link_code,
      obligationId: body.obligation_id,
      amount,
      idempotencyKey,
      destinationType: body.destination_type as SettleDestinationType,
      payerHint: body.path === "mismatch" ? "dogfood_mismatch" : "dogfood_ui",
    });

    // Deliberate amount mismatch: partner confirms less than instructed.
    // Currency stays correct so the UI shows a clear amount-due vs confirmed gap.
    const confirmAmount =
      body.path === "mismatch"
        ? new Prisma.Decimal(instructed.amount).minus(50).toFixed(2)
        : instructed.amount;

    const confirmed = await confirmPayment({
      partner,
      attemptId: instructed.attempt_id,
      customerReference: instructed.customer_reference,
      amount: confirmAmount,
      currency: instructed.currency,
      partnerPaymentId: `DOGFOOD-${body.path.toUpperCase()}-${Date.now()}`,
      settledAt: new Date().toISOString(),
      source: "dogfood_stub",
    });

    const proof = await prisma.proof.findUnique({
      where: { attemptId: instructed.attempt_id },
    });

    const { _internal, ...validatePublic } = validated;
    void _internal;

    const mismatch =
      body.path === "mismatch"
        ? {
            deliberate: true,
            what_differed: "amount",
            instructed: {
              amount: instructed.amount,
              currency: instructed.currency,
            },
            confirmed: {
              amount: confirmAmount,
              currency: instructed.currency,
            },
            note: "Partner confirmation amount does not match pay instructions (amount due).",
          }
        : null;

    return jsonOk({
      path: body.path,
      path_label:
        body.path === "mismatch"
          ? "Mismatch / needs a check"
          : "Happy path / confirmed",
      loop: ["validate", "instruct", "confirm", "proof"],
      validate: validatePublic,
      instruct: instructed,
      confirm: confirmed,
      mismatch,
      proof: proof
        ? {
            id: proof.id,
            storage_key: proof.storageKey,
            schema: "senda.proof.v1",
            payload: proof.payload,
          }
        : null,
      proof_issued: Boolean(proof),
      proof_note: proof
        ? "Payment proof (senda.proof.v1) issued for the organisation."
        : "No senda.proof.v1 issued — payment needs a check before proof.",
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
