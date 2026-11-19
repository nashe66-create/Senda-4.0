import { prisma } from "@/lib/db";
import { DogfoodClient } from "./dogfood-client";

export const dynamic = "force-dynamic";

export default async function DogfoodPage() {
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

  const options = obligations.map((o) => ({
    obligationId: o.externalId,
    linkCode: linkByBeneficiary.get(o.beneficiaryId) ?? "",
    label: `${o.beneficiary.name} · ${o.externalId} · ${o.amount.toFixed(2)} ${o.currency}`,
    amount: o.amount.toFixed(2),
  }));

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
          Dogfood · no live MTO
        </p>
        <h1 style={{ margin: "0.35rem 0 0", fontSize: "1.5rem" }}>
          validate → instruct → confirm → proof
        </h1>
        <p style={{ margin: "0.5rem 0 0", color: "var(--muted)", maxWidth: 640 }}>
          Runs the Connect loop on fixture data with a stub confirmation.
          Confirmations are background-style: no bursar mark-received step.
        </p>
      </div>
      <DogfoodClient options={options} />
    </div>
  );
}
