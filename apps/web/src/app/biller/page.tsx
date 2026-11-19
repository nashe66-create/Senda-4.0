import { redirect } from "next/navigation";
import { getBillerSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LogoutButton } from "./logout-button";

export const dynamic = "force-dynamic";

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
            Biller · beside school systems
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
        <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Obligations</h2>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Student</th>
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
                  >
                    {o.status}
                  </span>
                </td>
                <td>
                  {o.stale ? (
                    <span className="badge badge-warn">stale</span>
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
        <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Attempts</h2>
        {attempts.length === 0 ? (
          <p style={{ color: "var(--muted)", margin: 0 }}>
            No attempts yet. Run the{" "}
            <a href="/dogfood">dogfood loop</a> to create one.
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Attempt</th>
                <th>Student</th>
                <th>Ref</th>
                <th>Dest</th>
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
                    >
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="panel">
        <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Proofs</h2>
        {proofs.length === 0 ? (
          <p style={{ color: "var(--muted)", margin: 0 }}>No proofs yet.</p>
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
