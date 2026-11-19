import { redirect } from "next/navigation";
import { SettleDestinationType } from "@prisma/client";
import { getBillerSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  destinationTypeLabel,
  flagLabel,
  kybLabel,
  statusLabel,
} from "@/lib/ui-labels";
import { LogoutButton } from "./logout-button";

export const dynamic = "force-dynamic";

const CONNECT_CHECKLIST_TYPES: SettleDestinationType[] = [
  SettleDestinationType.bank_usd,
  SettleDestinationType.ecocash,
];

export default async function BillerPage() {
  const session = await getBillerSession();
  if (!session) {
    redirect("/login");
  }

  const institution = await prisma.institution.findUnique({
    where: { id: session.institutionId },
  });

  if (!institution) {
    redirect("/login");
  }

  const destinations = await prisma.settleDestination.findMany({
    where: {
      institutionId: institution.id,
      type: { in: CONNECT_CHECKLIST_TYPES },
    },
    orderBy: [{ type: "asc" }, { externalId: "asc" }],
  });

  const obligations = await prisma.obligation.findMany({
    where: { institutionId: institution.id },
    include: { beneficiary: true },
    orderBy: { createdAt: "asc" },
  });

  const attempts = await prisma.attempt.findMany({
    where: { obligation: { institutionId: institution.id } },
    include: {
      instruction: true,
      confirmation: true,
      proof: true,
      obligation: { include: { beneficiary: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const proofs = attempts.filter((a) => a.proof);

  const kybVerified = institution.kybStatus === "verified";
  const liveOk = institution.liveConnect;

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
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
            Biller · beside your finance tools
          </p>
          <h1 style={{ margin: "0.35rem 0 0", fontSize: "1.5rem" }}>
            {institution.name}
          </h1>
          <p style={{ margin: "0.35rem 0 0", color: "var(--muted)" }}>
            Signed in as {session.email}
          </p>
        </div>
        <LogoutButton />
      </div>

      <section className="panel">
        <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>
          Organisation checks
        </h2>
        <p style={{ margin: "0 0 1rem", color: "var(--muted)", fontSize: "0.9rem" }}>
          Thin checklist of what is verified vs pending before Connect can treat
          this organisation as live. Not a full KYB product — demo flags only.
        </p>

        <h3 style={{ margin: "0 0 0.5rem", fontSize: "0.9rem" }}>
          Organisation
        </h3>
        <ul
          style={{
            listStyle: "none",
            margin: "0 0 1.25rem",
            padding: 0,
            display: "grid",
            gap: "0.5rem",
          }}
        >
          <li
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
              alignItems: "center",
              padding: "0.45rem 0",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <span>
              Organisation checks (KYB){" "}
              <span className="mono" style={{ color: "var(--muted)" }}>
                kyb_status
              </span>
            </span>
            <span
              className={`badge ${kybVerified ? "badge-ok" : "badge-warn"}`}
              title={institution.kybStatus}
            >
              {kybVerified ? "Verified" : kybLabel(institution.kybStatus)}
            </span>
          </li>
          <li
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
              alignItems: "center",
              padding: "0.45rem 0",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <span>
              Live on Connect{" "}
              <span className="mono" style={{ color: "var(--muted)" }}>
                live_connect
              </span>
            </span>
            <span className={`badge ${liveOk ? "badge-ok" : "badge-warn"}`}>
              {liveOk ? "Live" : "Pending"}
            </span>
          </li>
        </ul>

        <h3 style={{ margin: "0 0 0.5rem", fontSize: "0.9rem" }}>
          Payout accounts
        </h3>
        <p style={{ margin: "0 0 0.65rem", color: "var(--muted)", fontSize: "0.85rem" }}>
          Connect settle destinations: Bank USD and organisation-owned EcoCash.
        </p>
        <table className="table">
          <thead>
            <tr>
              <th>Payout account</th>
              <th>Type</th>
              <th>Detail</th>
              <th>Check</th>
            </tr>
          </thead>
          <tbody>
            {destinations.map((d) => (
              <tr key={d.id}>
                <td className="mono">{d.externalId}</td>
                <td>{destinationTypeLabel(d.type)}</td>
                <td style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                  {d.type === SettleDestinationType.bank_usd
                    ? [d.bankName, d.accountNumber].filter(Boolean).join(" · ")
                    : [d.ownership, d.msisdn].filter(Boolean).join(" · ")}
                </td>
                <td>
                  <span
                    className={`badge ${d.verified ? "badge-ok" : "badge-warn"}`}
                  >
                    {d.verified ? "Verified" : "Pending"}
                  </span>
                </td>
              </tr>
            ))}
            {destinations.length === 0 && (
              <tr>
                <td colSpan={4} style={{ color: "var(--muted)" }}>
                  No Connect payout accounts seeded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="panel">
        <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Amounts due</h2>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Who it&apos;s for</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Flags</th>
            </tr>
          </thead>
          <tbody>
            {obligations.map((o) => (
              <tr key={o.id}>
                <td className="mono">{o.externalId}</td>
                <td>
                  {o.beneficiary.name}{" "}
                  <span className="mono" style={{ color: "var(--muted)" }}>
                    {o.beneficiary.studentRef}
                  </span>
                </td>
                <td className="mono">
                  {o.amount.toFixed(2)} {o.currency}
                </td>
                <td>
                  <span
                    className={`badge ${
                      o.status === "proven"
                        ? "badge-ok"
                        : o.status === "needs_reconcile"
                          ? "badge-warn"
                          : "badge-muted"
                    }`}
                    title={o.status}
                  >
                    {statusLabel(o.status)}
                  </span>
                </td>
                <td>
                  {o.stale ? (
                    <span className="badge badge-warn" title="stale">
                      {flagLabel("stale")}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel">
        <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Payments</h2>
        {attempts.length === 0 ? (
          <p style={{ color: "var(--muted)", margin: 0 }}>
            No payments yet. Run the{" "}
            <a href="/dogfood">test loop</a> to create one.
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Payment</th>
                <th>Who it&apos;s for</th>
                <th>Payment reference</th>
                <th>Payout</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a.id}>
                  <td className="mono" style={{ fontSize: "0.75rem" }}>
                    {a.id.slice(0, 12)}…
                  </td>
                  <td>{a.obligation.beneficiary.name}</td>
                  <td className="mono">
                    {a.instruction?.customerReference ?? "—"}
                  </td>
                  <td className="mono">{a.destinationType}</td>
                  <td>
                    <span
                      className={`badge ${
                        a.status === "proven"
                          ? "badge-ok"
                          : a.status === "needs_reconcile"
                            ? "badge-warn"
                            : "badge-muted"
                      }`}
                      title={a.status}
                    >
                      {statusLabel(a.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="panel">
        <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Payment proofs</h2>
        {proofs.length === 0 ? (
          <p style={{ color: "var(--muted)", margin: 0 }}>
            No payment proofs yet.
          </p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
            {proofs.map((a) => (
              <li key={a.id} style={{ marginBottom: "0.5rem" }}>
                <span className="mono">{a.proof!.storageKey}</span>{" "}
                <span style={{ color: "var(--muted)" }}>
                  · {a.obligation.beneficiary.name} ·{" "}
                  {a.instruction?.customerReference}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
