import {
  CountryCode,
  EcoCashOwnership,
  Prisma,
  SettleDestinationType,
  type Partner,
  type SettleDestination,
} from "@prisma/client";
import { prisma } from "./db";
import { writeProofArtifact } from "./proofs";

/** Connect-allowed settle destination types (lock #10). */
export const CONNECT_DESTINATION_TYPES: SettleDestinationType[] = [
  SettleDestinationType.bank_usd,
  SettleDestinationType.ecocash,
];

export type ConnectErrorCode =
  | "institution_not_live"
  | "obligation_not_found"
  | "obligation_not_open"
  | "obligation_stale"
  | "link_mismatch"
  | "destination_rejected"
  | "destination_unverified"
  | "partner_capability_mismatch"
  | "corridor_not_supported"
  | "amount_mismatch"
  | "idempotency_conflict"
  | "attempt_not_found"
  | "already_confirmed"
  | "reference_mismatch"
  | "validation_error";

export class ConnectError extends Error {
  constructor(
    public code: ConnectErrorCode,
    message: string,
    public status = 400,
  ) {
    super(message);
    this.name = "ConnectError";
  }
}

export function isConnectEligibleDestination(
  dest: SettleDestination,
): { ok: true } | { ok: false; reason: string } {
  if (!CONNECT_DESTINATION_TYPES.includes(dest.type)) {
    return {
      ok: false,
      reason: `Destination type '${dest.type}' is not a Connect settle destination (allowed: bank_usd, school-owned ecocash)`,
    };
  }

  if (dest.type === SettleDestinationType.ecocash) {
    if (
      dest.ownership !== EcoCashOwnership.school_merchant &&
      dest.ownership !== EcoCashOwnership.school_institutional
    ) {
      return {
        ok: false,
        reason:
          "EcoCash destination must be school-owned (school_merchant or school_institutional); relative/staff personal wallets are rejected",
      };
    }
  }

  if (!dest.verified) {
    return { ok: false, reason: "Settle destination is not verified" };
  }

  return { ok: true };
}

export function partnerCanSettle(
  partner: Partner,
  destType: SettleDestinationType,
  institutionCountry: CountryCode,
): { ok: true } | { ok: false; reason: string } {
  if (!partner.corridors.includes(institutionCountry)) {
    return {
      ok: false,
      reason: `Partner does not support corridor country ${institutionCountry}`,
    };
  }
  if (!partner.destinationCapabilities.includes(destType)) {
    return {
      ok: false,
      reason: `Partner cannot settle destination type '${destType}' (capabilities: ${partner.destinationCapabilities.join(", ") || "none"})`,
    };
  }
  return { ok: true };
}

export function freezeDestination(dest: SettleDestination) {
  return {
    id: dest.externalId,
    type: dest.type,
    currency: dest.currency,
    verified: dest.verified,
    account_title: dest.accountTitle,
    bank_name: dest.bankName,
    account_number: dest.accountNumber,
    ownership: dest.ownership,
    msisdn: dest.msisdn,
  };
}

function generateCustomerReference(attemptId: string): string {
  const short = attemptId.replace(/[^a-zA-Z0-9]/g, "").slice(-8).toUpperCase();
  const ts = Date.now().toString(36).toUpperCase();
  return `SND-${ts}-${short}`;
}

export async function validatePayment(input: {
  partner: Partner;
  linkCode: string;
  obligationId: string;
  amount?: string | number;
  destinationType?: SettleDestinationType;
}) {
  const link = await prisma.link.findUnique({
    where: { linkCode: input.linkCode },
    include: {
      institution: true,
      beneficiary: true,
    },
  });

  if (!link || !link.active) {
    throw new ConnectError(
      "link_mismatch",
      `Link code '${input.linkCode}' not found or inactive`,
      404,
    );
  }

  if (link.institution.country !== CountryCode.ZW) {
    throw new ConnectError(
      "corridor_not_supported",
      `Live Connect pilot is ZW only; institution country is ${link.institution.country}`,
    );
  }

  if (
    !link.institution.liveConnect ||
    link.institution.kybStatus !== "verified"
  ) {
    throw new ConnectError(
      "institution_not_live",
      "Institution is not verified / live on Connect",
    );
  }

  const obligation = await prisma.obligation.findFirst({
    where: {
      OR: [
        { id: input.obligationId },
        { externalId: input.obligationId },
      ],
    },
    include: { beneficiary: true, feeTemplate: true },
  });

  if (!obligation) {
    throw new ConnectError(
      "obligation_not_found",
      `Obligation '${input.obligationId}' not found`,
      404,
    );
  }

  if (obligation.institutionId !== link.institutionId) {
    throw new ConnectError(
      "link_mismatch",
      "Obligation does not belong to the institution on this Link",
    );
  }

  if (obligation.beneficiaryId !== link.beneficiaryId) {
    throw new ConnectError(
      "link_mismatch",
      "Obligation beneficiary does not match Link beneficiary",
    );
  }

  if (obligation.status !== "open" && obligation.status !== "instructed") {
    throw new ConnectError(
      "obligation_not_open",
      `Obligation status is '${obligation.status}'; expected open`,
    );
  }

  if (obligation.stale) {
    throw new ConnectError(
      "obligation_stale",
      "Obligation is marked stale; refresh dues before instructing",
    );
  }

  if (input.amount !== undefined) {
    const requested = new Prisma.Decimal(input.amount);
    if (!requested.equals(obligation.amount)) {
      throw new ConnectError(
        "amount_mismatch",
        `Amount ${requested} does not match obligation amount ${obligation.amount}`,
      );
    }
  }

  const destinations = await prisma.settleDestination.findMany({
    where: { institutionId: link.institutionId },
  });

  const preferredType =
    input.destinationType ?? SettleDestinationType.bank_usd;

  const candidates = destinations.filter((d) => d.type === preferredType);
  const dest =
    candidates.find((d) => isConnectEligibleDestination(d).ok === true) ??
    null;

  if (!dest) {
    const anyOfType = candidates[0];
    if (anyOfType) {
      const check = isConnectEligibleDestination(anyOfType);
      if (!check.ok) {
        throw new ConnectError("destination_rejected", check.reason);
      }
    }
    throw new ConnectError(
      "destination_rejected",
      `No eligible Connect destination of type '${preferredType}' for this institution`,
    );
  }

  const eligibility = isConnectEligibleDestination(dest);
  if (!eligibility.ok) {
    throw new ConnectError(
      eligibility.reason.includes("not verified")
        ? "destination_unverified"
        : "destination_rejected",
      eligibility.reason,
    );
  }

  const capability = partnerCanSettle(
    input.partner,
    dest.type,
    link.institution.country,
  );
  if (!capability.ok) {
    throw new ConnectError("partner_capability_mismatch", capability.reason);
  }

  return {
    ok: true as const,
    institution: {
      id: link.institution.externalId,
      name: link.institution.name,
      country: link.institution.country,
    },
    beneficiary: {
      id: link.beneficiary.externalId,
      name: link.beneficiary.name,
      student_ref: link.beneficiary.studentRef,
    },
    link: { link_code: link.linkCode, binding: link.binding },
    obligation: {
      id: obligation.externalId,
      amount: obligation.amount.toFixed(2),
      currency: obligation.currency,
      status: obligation.status,
      due_label: obligation.dueLabel,
    },
    destination: freezeDestination(dest),
    _internal: { link, obligation, dest },
  };
}

export async function instructPayment(input: {
  partner: Partner;
  linkCode: string;
  obligationId: string;
  amount: string | number;
  idempotencyKey: string;
  destinationType?: SettleDestinationType;
  payerHint?: string;
}) {
  const existing = await prisma.attempt.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
    include: { instruction: true, obligation: true, link: true },
  });

  if (existing) {
    if (
      existing.link.linkCode !== input.linkCode ||
      (existing.obligation.externalId !== input.obligationId &&
        existing.obligationId !== input.obligationId)
    ) {
      throw new ConnectError(
        "idempotency_conflict",
        "Idempotency key already used for a different obligation/link",
        409,
      );
    }
    if (existing.instruction) {
      return {
        attempt_id: existing.id,
        customer_reference: existing.instruction.customerReference,
        destination: existing.instruction.frozenDestination,
        amount: existing.instruction.amount.toFixed(2),
        currency: existing.instruction.currency,
        status: existing.status,
        idempotent_replay: true,
      };
    }
  }

  const validated = await validatePayment({
    partner: input.partner,
    linkCode: input.linkCode,
    obligationId: input.obligationId,
    amount: input.amount,
    destinationType: input.destinationType,
  });

  const { link, obligation, dest } = validated._internal;

  const attempt = await prisma.$transaction(async (tx) => {
    const created = await tx.attempt.create({
      data: {
        partnerId: input.partner.id,
        obligationId: obligation.id,
        linkId: link.id,
        idempotencyKey: input.idempotencyKey,
        status: "instructed",
        amount: obligation.amount,
        currency: obligation.currency,
        destinationType: dest.type,
        payerHint: input.payerHint,
      },
    });

    const customerReference = generateCustomerReference(created.id);

    await tx.instruction.create({
      data: {
        attemptId: created.id,
        customerReference,
        settleDestinationId: dest.id,
        frozenDestination: freezeDestination(dest),
        amount: obligation.amount,
        currency: obligation.currency,
      },
    });

    await tx.obligation.update({
      where: { id: obligation.id },
      data: { status: "instructed" },
    });

    return tx.attempt.findUniqueOrThrow({
      where: { id: created.id },
      include: { instruction: true },
    });
  });

  return {
    attempt_id: attempt.id,
    customer_reference: attempt.instruction!.customerReference,
    destination: attempt.instruction!.frozenDestination,
    amount: attempt.instruction!.amount.toFixed(2),
    currency: attempt.instruction!.currency,
    status: attempt.status,
    idempotent_replay: false,
  };
}

export async function confirmPayment(input: {
  partner: Partner;
  attemptId: string;
  customerReference: string;
  amount: string | number;
  currency: string;
  partnerPaymentId?: string;
  settledAt?: string;
  source?: "partner_api" | "dogfood_stub" | "manual_ops";
}) {
  const attempt = await prisma.attempt.findUnique({
    where: { id: input.attemptId },
    include: {
      instruction: true,
      confirmation: true,
      proof: true,
      obligation: { include: { beneficiary: true, institution: true } },
      link: true,
      partner: true,
    },
  });

  if (!attempt || !attempt.instruction) {
    throw new ConnectError(
      "attempt_not_found",
      `Attempt '${input.attemptId}' not found or not instructed`,
      404,
    );
  }

  const instruction = attempt.instruction;

  if (
    attempt.partnerId &&
    attempt.partnerId !== input.partner.id &&
    input.source !== "dogfood_stub"
  ) {
    throw new ConnectError(
      "attempt_not_found",
      "Attempt does not belong to this partner",
      404,
    );
  }

  // Idempotent replay — proven attempts have proof; needs_reconcile has none
  if (attempt.confirmation) {
    if (
      attempt.confirmation.reconResult === "proven" &&
      !attempt.proof
    ) {
      throw new ConnectError(
        "already_confirmed",
        "Attempt already confirmed but proof missing — contact ops",
        409,
      );
    }
    return {
      attempt_id: attempt.id,
      status: attempt.status,
      recon_result: attempt.confirmation.reconResult,
      recon_notes: attempt.confirmation.reconNotes,
      proof_id: attempt.proof?.id ?? null,
      storage_key: attempt.proof?.storageKey ?? null,
      proof_issued: Boolean(attempt.proof),
      instructed: {
        amount: instruction.amount.toFixed(2),
        currency: instruction.currency,
      },
      confirmed: {
        amount: attempt.confirmation.amount.toFixed(2),
        currency: attempt.confirmation.currency,
      },
      idempotent_replay: true,
    };
  }

  if (instruction.customerReference !== input.customerReference) {
    throw new ConnectError(
      "reference_mismatch",
      "customer_reference does not match instruction",
    );
  }

  const confirmedAmount = new Prisma.Decimal(input.amount);
  const amountOk = confirmedAmount.equals(instruction.amount);
  const currencyOk =
    input.currency.toUpperCase() === instruction.currency.toUpperCase();

  const reconResult =
    amountOk && currencyOk ? "proven" : "needs_reconcile";
  const reconNotes = !amountOk
    ? `Amount mismatch: instructed ${instruction.amount} vs confirmed ${confirmedAmount}`
    : !currencyOk
      ? `Currency mismatch: instructed ${instruction.currency} vs confirmed ${input.currency}`
      : null;

  const settledAt = input.settledAt
    ? new Date(input.settledAt)
    : new Date();

  const result = await prisma.$transaction(async (tx) => {
    const confirmation = await tx.confirmation.create({
      data: {
        attemptId: attempt.id,
        customerReference: input.customerReference,
        amount: confirmedAmount,
        currency: input.currency.toUpperCase(),
        partnerPaymentId: input.partnerPaymentId,
        settledAt,
        source: input.source ?? "partner_api",
        reconResult,
        reconNotes,
      },
    });

    const attemptStatus =
      reconResult === "proven" ? "proven" : "needs_reconcile";
    const obligationStatus =
      reconResult === "proven" ? "proven" : "needs_reconcile";

    await tx.attempt.update({
      where: { id: attempt.id },
      data: { status: attemptStatus },
    });

    await tx.obligation.update({
      where: { id: attempt.obligationId },
      data: { status: obligationStatus },
    });

    // Trusted senda.proof.v1 only when amount + currency match.
    // Mismatch → needs a check; no payment proof issued for the organisation.
    if (reconResult !== "proven") {
      return { confirmation, proof: null, attemptStatus };
    }

    const proofPayload = {
      schema: "senda.proof.v1",
      attempt_id: attempt.id,
      customer_reference: input.customerReference,
      institution: {
        id: attempt.obligation.institution.externalId,
        name: attempt.obligation.institution.name,
        country: attempt.obligation.institution.country,
      },
      beneficiary: {
        id: attempt.obligation.beneficiary.externalId,
        name: attempt.obligation.beneficiary.name,
        student_ref: attempt.obligation.beneficiary.studentRef,
      },
      obligation: {
        id: attempt.obligation.externalId,
        amount: attempt.obligation.amount.toFixed(2),
        currency: attempt.obligation.currency,
      },
      instruction: {
        amount: instruction.amount.toFixed(2),
        currency: instruction.currency,
        frozen_destination: instruction.frozenDestination,
      },
      confirmation: {
        amount: confirmedAmount.toFixed(2),
        currency: input.currency.toUpperCase(),
        partner_payment_id: input.partnerPaymentId ?? null,
        settled_at: settledAt.toISOString(),
        source: input.source ?? "partner_api",
      },
      recon: {
        result: reconResult,
        notes: reconNotes,
      },
      proven_at: new Date().toISOString(),
    };

    const storageKey = await writeProofArtifact(attempt.id, proofPayload);

    const proof = await tx.proof.create({
      data: {
        attemptId: attempt.id,
        storageKey,
        payload: proofPayload,
      },
    });

    return { confirmation, proof, attemptStatus };
  });

  return {
    attempt_id: attempt.id,
    status: result.attemptStatus,
    recon_result: reconResult,
    recon_notes: reconNotes,
    proof_id: result.proof?.id ?? null,
    storage_key: result.proof?.storageKey ?? null,
    proof_issued: Boolean(result.proof),
    instructed: {
      amount: instruction.amount.toFixed(2),
      currency: instruction.currency,
    },
    confirmed: {
      amount: confirmedAmount.toFixed(2),
      currency: input.currency.toUpperCase(),
    },
    idempotent_replay: false,
  };
}
