import { prisma } from "@/lib/db";
import { PilotClient } from "./pilot-client";

export const dynamic = "force-dynamic";

const DEFAULT_SANDBOX_KEY = "sk_sandbox_partner_demo";

export default async function PilotPage() {
  const sandboxApiKey =
    process.env.SANDBOX_API_KEY ||
    process.env.SANDBOX_API_KEY_MUKURU ||
    DEFAULT_SANDBOX_KEY;

  const institution = await prisma.institution.findFirst({
    where: { externalId: "inst_heritage_demo" },
    include: {
      destinations: {
        where: {
          OR: [
            { type: "bank_usd" },
            {
              type: "ecocash",
              ownership: { in: ["school_merchant", "school_institutional"] },
            },
          ],
        },
      },
    },
  });

  const obligations = await prisma.obligation.findMany({
    where: { status: "open", stale: false },
    include: {
      beneficiary: true,
      institution: true,
    },
    orderBy: { externalId: "asc" },
  });

  const links = await prisma.link.findMany({
    where: { active: true },
    include: { beneficiary: true },
  });

  const linkByBeneficiary = new Map(
    links.map((l) => [l.beneficiaryId, l.linkCode]),
  );

  const bills = obligations.map((o) => ({
    obligationId: o.externalId,
    linkCode: linkByBeneficiary.get(o.beneficiaryId) ?? "",
    who: o.beneficiary.name,
    orgName: o.institution.name,
    label: `${o.beneficiary.name} · ${o.dueLabel ?? o.externalId} · ${o.amount.toFixed(2)} ${o.currency}`,
    amount: o.amount.toFixed(2),
    currency: o.currency,
  }));

  const verifiedDests =
    institution?.destinations.filter((d) => d.verified).length ?? 0;
  const totalDests = institution?.destinations.length ?? 0;

  const checklist = {
    organisationName: institution?.name ?? "Demo organisation (seed missing)",
    kybVerified: institution?.kybStatus === "verified",
    liveConnect: Boolean(institution?.liveConnect),
    verifiedDestinations: verifiedDests,
    destinationCount: totalDests,
    openBills: bills.length,
    partnerKeyHint: sandboxApiKey.slice(0, 14) + "…",
    bursarEmail: "bursar@heritage-demo.zw",
  };

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      <div>
        <p
          style={{
            margin: 0,
            color: "var(--muted)",
            fontSize: "0.8rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Wedge pilot · Connect + Biller
        </p>
        <h1 style={{ margin: "0.35rem 0 0", fontSize: "1.5rem" }}>
          Walk the loop: bill → pay instructions → confirm → bursar proof
        </h1>
        <p style={{ margin: "0.5rem 0 0", color: "var(--muted)", maxWidth: 680 }}>
          Guided sandbox path for a real partner walkthrough. Calls Connect with
          the demo partner API key (validate → instruct → sandbox confirm). Then
          shows what the bursar sees. Not a live bank webhook — confirm is
          partner attestation in the sandbox.
        </p>
      </div>
      <PilotClient
        bills={bills}
        sandboxApiKey={sandboxApiKey}
        checklist={checklist}
      />
    </div>
  );
}
