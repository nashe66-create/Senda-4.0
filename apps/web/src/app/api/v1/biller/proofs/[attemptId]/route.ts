import { readFile } from "fs/promises";
import path from "path";
import { getBillerSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jsonError, handleRouteError } from "@/lib/api";

export const dynamic = "force-dynamic";

/**
 * Biller-authenticated proof download.
 * Returns the stored payment-proof JSON for an attempt belonging to the
 * signed-in organisation. Used from the Biller payments list.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ attemptId: string }> },
) {
  try {
    const session = await getBillerSession();
    if (!session) {
      return jsonError("unauthorized", "Sign in as a bursar to view proofs.", 401);
    }

    const { attemptId } = await context.params;
    const attempt = await prisma.attempt.findFirst({
      where: {
        id: attemptId,
        obligation: { institutionId: session.institutionId },
      },
      include: { proof: true },
    });

    if (!attempt) {
      return jsonError("not_found", "Payment not found for this organisation.", 404);
    }
    if (!attempt.proof) {
      return jsonError(
        "proof_missing",
        "No payment proof yet for this payment.",
        404,
      );
    }

    const storageKey = attempt.proof.storageKey;
    // local://proof_<id>.json → read from PROOF_STORAGE_DIR; fall back to DB payload
    if (storageKey.startsWith("local://")) {
      const fileName = storageKey.slice("local://".length);
      const root = process.env.PROOF_STORAGE_DIR || "./proofs";
      const absRoot = path.isAbsolute(root)
        ? root
        : path.join(process.cwd(), root);
      try {
        const raw = await readFile(path.join(absRoot, fileName), "utf8");
        return new Response(raw, {
          status: 200,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "content-disposition": `attachment; filename="${fileName}"`,
          },
        });
      } catch {
        // Fall through to DB payload
      }
    }

    return new Response(JSON.stringify(attempt.proof.payload, null, 2), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "content-disposition": `attachment; filename="proof_${attemptId}.json"`,
      },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
