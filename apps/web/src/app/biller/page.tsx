import Link from "next/link";
import { redirect } from "next/navigation";
import {
  EcoCashOwnership,
  SettleDestinationType,
} from "@prisma/client";
import { getBillerSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  destinationTypeLabel,
  flagLabel,
  kybLabel,
  statusBadgeClass,
  statusLabel,
} from "@/lib/ui-labels";
import { LogoutButton } from "./logout-button";

export const dynamic = "force-dynamic";

/** Connect-eligible payout types (cash / relative wallets are out of Connect). */
const CONNECT_CHECKLIST_TYPES: SettleDestinationType[] = [
  SettleDestinationType.bank_usd,
  SettleDestinationType.ecocash,
];

const ORG_ECOCASH: EcoCashOwnership[] = [
  EcoCashOwnership.school_merchant,
  EcoCashOwnership.school_institutional,
];

function money(amount: { toFixed: (n: number) => string }, currency: string) {
  return `${Number(amount).toFixed(2)} ${currency}`;
}

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

  const destinationsRaw = await prisma.settleDestination.findMany({
    where: {
      institutionId: institution.id,
      type: { in: CONNECT_CHECKLIST_TYPES },
    },
    orderBy: [{ type: "asc" }, { externalId: "asc" }],
  });
  // Checklist = Connect settle destinations only (org EcoCash, not relative/staff).
  const destinations = destinationsRaw.filter(
    (d) =>
      d.type === SettleDestinationType.bank_usd ||
      (d.type === SettleDestinationType.ecocash &&
        d.ownership != null &&
        ORG_ECOCASH.includes(d.ownership)),
  );

  const beneficiaries = await prisma.beneficiary.findMany({
    where: { institutionId: institution.id, active: true },
    include: {
      links: { where: { active: true }, orderBy: { createdAt: "asc" }, take: 1 },
    },
    orderBy: { name: "asc" },
  });

  const obligations = await prisma.obligation.findMany({
    where: { institutionId: institution.id },
    include: { beneficiary: true },
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
  });

  const attempts = await prisma.attempt.findMany({
    where: { obligation: { institutionId: institution.id } },
    include: {
      instruction: true,
      confirmation: true,
      proof: true,
      obligation: { include: { beneficiary: true } },
      partner: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const openBills = obligations.filter((o) => o.status === "open");
  const needsCheckBills = obligations.filter(
    (o) => o.status === "needs_reconcile",
  );
  const needsCheckPayments = attempts.filter(
    (a) => a.status === "needs_reconcile",
  );
  const confirmedPayments = attempts.filter((a) => a.status === "proven");

  const kybVerified = institution.kybStatus === "verified";
  const liveOk = institution.liveConnect;
  const verifiedDests = destinations.filter((d) => d.verified);
  const pendingDests = destinations.filter((d) => !d.verified);
  const hasVerifiedBank = destinations.some(
    (d) => d.type === SettleDestinationType.bank_usd && d.verified,
  );
  const hasVerifiedEco = destinations.some(
    (d) => d.type === SettleDestinationType.ecocash && d.verified,
  );
  const checklistReady = kybVerified && liveOk && verifiedDests.length > 0;

  const checklistNextSteps: string[] = [];
  if (!kybVerified) {
    checklistNextSteps.push(
      "Organisation checks are still pending — ops must verify the organisation before Connect treats it as live.",
    );
  }
  if (!liveOk) {
    checklistNextSteps.push(
      "Live on Connect is off — turn it on after organisation checks and at least one payout account are verified.",
    );
  }
  if (pendingDests.length > 0) {
    checklistNextSteps.push(
      `${pendingDests.length} payout account${pendingDests.length === 1 ? "" : "s"} still pending verification (Bank USD / EcoCash).`,
    );
  }
  if (!hasVerifiedBank && !hasVerifiedEco && destinations.length > 0) {
    checklistNextSteps.push(
      "No verified Connect payout account yet — partners cannot settle until Bank USD or organisation EcoCash is verified.",
    );
  }
  if (checklistReady && pendingDests.length === 0) {
    checklistNextSteps.push(
      "Ready for partners: organisation verified, live on Connect, and Connect payout accounts verified.",
    );
  }

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
            <span style={{ margin: "0 0.4rem", color: "var(--border)" }}>·</span>
            {institution.country} organisation
          </p>
        </div>
        <LogoutButton />
      </div>

      {/* At a glance */}
      <section
        className="panel"
        style={{
          display: "grid",
          gap: "0.75rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        }}
      >
        <Stat
          label="Open bills"
          value={String(openBills.length)}
          hint="Amounts still owed"
        />
        <Stat
          label="Needs a check"
          value={String(needsCheckBills.length + needsCheckPayments.length)}
          hint="Bills or payments to review"
          warn={needsCheckBills.length + needsCheckPayments.length > 0}
        />
        <Stat
          label="Confirmed pays"
          value={String(confirmedPayments.length)}
          hint="Payment proofs available"
          ok={confirmedPayments.length > 0}
        />
        <Stat
          label="Payout checks"
          value={
            destinations.length === 0
              ? "—"
              : `${verifiedDests.length}/${destinations.length}`
          }
          hint="Verified payout accounts"
          ok={checklistReady}
          warn={!checklistReady}
        />
      </section>

      {/* Destination / org checks */}
      <section className="panel" id="destination-checks">
        <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>
          Destination checks
        </h2>
        <p style={{ margin: "0 0 0.75rem", color: "var(--muted)", fontSize: "0.9rem" }}>
          Thin checklist of what is verified vs pending before partners can settle
          to this organisation. Not a full KYB product — flags only.
        </p>

        <div
          style={{
            marginBottom: "1rem",
            padding: "0.75rem 0.9rem",
            borderRadius: 6,
            border: `1px solid ${checklistReady ? "var(--accent-soft)" : "#6a5830"}`,
            background: "var(--bg-elevated)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "0.75rem",
              flexWrap: "wrap",
              alignItems: "center",
              marginBottom: "0.35rem",
            }}
          >
            <strong style={{ fontSize: "0.95rem" }}>
              {checklistReady ? "Ready for Connect" : "Action needed"}
            </strong>
            <span
              className={`badge ${checklistReady ? "badge-ok" : "badge-warn"}`}
            >
              {checklistReady ? "Clear" : "Pending items"}
            </span>
          </div>
          <ul
            style={{
              margin: 0,
              paddingLeft: "1.1rem",
              color: "var(--muted)",
              fontSize: "0.85rem",
              display: "grid",
              gap: "0.25rem",
            }}
          >
            {checklistNextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>

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
          <CheckRow
            label="Organisation checks"
            system="kyb_status"
            ok={kybVerified}
            value={kybVerified ? "Verified" : kybLabel(institution.kybStatus)}
            title={institution.kybStatus}
          />
          <CheckRow
            label="Live on Connect"
            system="live_connect"
            ok={liveOk}
            value={liveOk ? "Live" : "Pending"}
          />
        </ul>

        <h3 style={{ margin: "0 0 0.5rem", fontSize: "0.9rem" }}>
          Payout accounts
        </h3>
        <p style={{ margin: "0 0 0.65rem", color: "var(--muted)", fontSize: "0.85rem" }}>
          Where money can settle: Bank USD and organisation-owned EcoCash.
          Pending rows block that account until verified.
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
                  No Connect payout accounts seeded. Ask ops to add Bank USD or
                  organisation EcoCash.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Amounts due / bills */}
      <section className="panel" id="amounts-due">
        <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>
          Amounts due / bills
        </h2>
        <p style={{ margin: "0 0 0.85rem", color: "var(--muted)", fontSize: "0.9rem" }}>
          Open bills for people linked to this organisation. Partners settle
          against these amounts due — not a full ledger.
        </p>
        {obligations.length === 0 ? (
          <p style={{ color: "var(--muted)", margin: 0 }}>
            No amounts due yet.
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Bill</th>
                <th>Who it&apos;s for</th>
                <th>Amount due</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {obligations.map((o) => (
                <tr key={o.id}>
                  <td>
                    <div className="mono" style={{ fontSize: "0.8rem" }}>
                      {o.externalId}
                    </div>
                    {o.dueLabel && (
                      <div
                        style={{
                          color: "var(--muted)",
                          fontSize: "0.8rem",
                          marginTop: "0.15rem",
                        }}
                      >
                        {o.dueLabel}
                      </div>
                    )}
                  </td>
                  <td>
                    <div>{o.beneficiary.name}</div>
                    <div
                      className="mono"
                      style={{ color: "var(--muted)", fontSize: "0.75rem" }}
                    >
                      ref {o.beneficiary.studentRef}
                    </div>
                  </td>
                  <td className="mono">{money(o.amount, o.currency)}</td>
                  <td>
                    <span
                      className={`badge ${statusBadgeClass(o.status)}`}
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
        )}
      </section>

      {/* Thin exceptions queue */}
      {(needsCheckPayments.length > 0 || needsCheckBills.length > 0) && (
        <section className="panel" id="needs-a-check">
          <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Needs a check</h2>
          <p style={{ margin: "0 0 0.85rem", color: "var(--muted)", fontSize: "0.9rem" }}>
            Thin ops queue — payments or bills that did not match cleanly.
            Partners and bursars both see “needs a check.”
          </p>
          {needsCheckPayments.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Payment</th>
                  <th>Who it&apos;s for</th>
                  <th>Payment reference</th>
                  <th>Why</th>
                </tr>
              </thead>
              <tbody>
                {needsCheckPayments.map((a) => (
                  <tr key={a.id}>
                    <td className="mono" style={{ fontSize: "0.75rem" }}>
                      {a.id.slice(0, 12)}…
                    </td>
                    <td>{a.obligation.beneficiary.name}</td>
                    <td className="mono">
                      {a.instruction?.customerReference ?? "—"}
                    </td>
                    <td style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                      {a.confirmation?.reconNotes ??
                        "Amount, currency, or payment reference did not match"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: "var(--muted)", margin: 0 }}>
              Bills flagged for review:{" "}
              {needsCheckBills.map((o) => o.externalId).join(", ")}
            </p>
          )}
        </section>
      )}

      {/* Payment status */}
      <section className="panel" id="payments">
        <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Payment status</h2>
        <p style={{ margin: "0 0 0.85rem", color: "var(--muted)", fontSize: "0.9rem" }}>
          Attempts and confirmations for this organisation&apos;s bills: pending,
          confirmed, or needs a check. Open a payment proof when one exists.
        </p>
        {attempts.length === 0 ? (
          <p style={{ color: "var(--muted)", margin: 0 }}>
            No payments yet. Run the{" "}
            <Link href="/dogfood">test loop</Link> to create a confirmed pay (or
            a mismatch that needs a check).
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Payment</th>
                <th>Who it&apos;s for</th>
                <th>Bill</th>
                <th>Payment reference</th>
                <th>Payout</th>
                <th>Status</th>
                <th>Proof</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a.id}>
                  <td className="mono" style={{ fontSize: "0.75rem" }}>
                    {a.id.slice(0, 12)}…
                    {a.partner && (
                      <div
                        style={{
                          color: "var(--muted)",
                          fontSize: "0.7rem",
                          marginTop: "0.15rem",
                        }}
                      >
                        via {a.partner.name}
                      </div>
                    )}
                  </td>
                  <td>{a.obligation.beneficiary.name}</td>
                  <td className="mono" style={{ fontSize: "0.75rem" }}>
                    {a.obligation.externalId}
                  </td>
                  <td className="mono">
                    {a.instruction?.customerReference ?? "—"}
                  </td>
                  <td>{destinationTypeLabel(a.destinationType)}</td>
                  <td>
                    <span
                      className={`badge ${statusBadgeClass(a.status)}`}
                      title={a.status}
                    >
                      {statusLabel(a.status)}
                    </span>
                  </td>
                  <td>
                    {a.proof ? (
                      <a
                        href={`/api/v1/biller/proofs/${a.id}`}
                        download
                      >
                        Download
                      </a>
                    ) : a.status === "needs_reconcile" ? (
                      <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        No proof (needs a check)
                      </span>
                    ) : (
                      <span style={{ color: "var(--muted)" }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Who it's for — thin roster (no CSV import in M5) */}
      <section className="panel" id="roster">
        <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Who it&apos;s for</h2>
        <p style={{ margin: "0 0 0.85rem", color: "var(--muted)", fontSize: "0.9rem" }}>
          People linked to this organisation (students in the school-fees wedge;
          other biller types later). CSV import stays a later onboarding step —
          this list is read-only from seed / ops.
        </p>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Their ref</th>
              <th>Pay code</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {beneficiaries.map((b) => (
              <tr key={b.id}>
                <td>{b.name}</td>
                <td className="mono">{b.studentRef}</td>
                <td className="mono">
                  {b.links[0]?.linkCode ?? "—"}
                </td>
                <td style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                  {b.grade ?? "—"}
                </td>
              </tr>
            ))}
            {beneficiaries.length === 0 && (
              <tr>
                <td colSpan={4} style={{ color: "var(--muted)" }}>
                  No people linked yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  ok,
  warn,
}: {
  label: string;
  value: string;
  hint: string;
  ok?: boolean;
  warn?: boolean;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: "0.75rem",
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "1.45rem",
          fontWeight: 600,
          marginTop: "0.2rem",
          color: ok ? "#9fe0c5" : warn ? "#e8d5a3" : "var(--text)",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{hint}</div>
    </div>
  );
}

function CheckRow({
  label,
  system,
  ok,
  value,
  title,
}: {
  label: string;
  system: string;
  ok: boolean;
  value: string;
  title?: string;
}) {
  return (
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
        {label}{" "}
        <span className="mono" style={{ color: "var(--muted)" }}>
          {system}
        </span>
      </span>
      <span className={`badge ${ok ? "badge-ok" : "badge-warn"}`} title={title}>
        {value}
      </span>
    </li>
  );
}
