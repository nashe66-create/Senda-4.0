import { prisma } from "@/lib/db";
import { jsonOk, jsonError, handleRouteError } from "@/lib/api";
import { statusLabel } from "@/lib/ui-labels";

export const dynamic = "force-dynamic";

/**
 * Pilot / sandbox handoff: what the bursar will see for one payment.
 * Read-only glue for `/pilot` + the curl script — not a production partner API.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const attemptId = (url.searchParams.get("attempt_id") ?? "").trim();
    if (!attemptId) {
      return jsonError(
        "validation_error",
        "Pass attempt_id (from Connect instruct).",
        400,
      );
    }

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        instruction: true,
        confirmation: true,
        proof: true,
        partner: true,
        obligation: {
          include: {
            beneficiary: true,
            institution: true,
          },
        },
      },
    });

    if (!attempt) {
      return jsonError("attempt_not_found", "No payment found for that id.", 404);
    }

    const status = attempt.status;
    const proofIssued = Boolean(attempt.proof);
    const needsCheck = status === "needs_reconcile";

    return jsonOk({
      surface: "pilot_handoff",
      label:
        "Sandbox bursar view — same payment the organisation sees in Biller after login.",
      attempt_id: attempt.id,
      organisation: {
        name: attempt.obligation.institution.name,
        external_id: attempt.obligation.institution.externalId,
        country: attempt.obligation.institution.country,
      },
      who_its_for: {
        name: attempt.obligation.beneficiary.name,
        their_ref: attempt.obligation.beneficiary.studentRef,
      },
      bill: {
        id: attempt.obligation.externalId,
        amount: attempt.obligation.amount.toFixed(2),
        currency: attempt.obligation.currency,
        due_label: attempt.obligation.dueLabel,
      },
      payment_reference: attempt.instruction?.customerReference ?? null,
      partner: attempt.partner?.name ?? null,
      status,
      status_label: statusLabel(status),
      recon_result: attempt.confirmation?.reconResult ?? null,
      recon_notes: attempt.confirmation?.reconNotes ?? null,
      proof_issued: proofIssued,
      proof: attempt.proof
        ? {
            id: attempt.proof.id,
            storage_key: attempt.proof.storageKey,
            schema: "senda.proof.v1",
          }
        : null,
      bursar: {
        login_path: "/login",
        biller_path: "/biller",
        payments_anchor: "/biller#payments",
        needs_check_anchor: "/biller#needs-a-check",
        proof_download_path: proofIssued
          ? `/api/v1/biller/proofs/${attempt.id}`
          : null,
        demo_email: "bursar@heritage-demo.zw",
        note: needsCheck
          ? "Bursar will see Needs a check — no payment proof until the mismatch clears."
          : proofIssued
            ? "Bursar can download senda.proof.v1 from Payment status after sign-in."
            : "Payment is not confirmed yet — no proof for the organisation.",
      },
      sandbox_note:
        "Confirm in this pilot is sandbox partner attestation, not a live MTO webhook or bank credit feed.",
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
