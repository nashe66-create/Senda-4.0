import Link from "next/link";

export default function HomePage() {
  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <section className="panel">
        <p
          style={{
            margin: 0,
            color: "var(--muted)",
            fontSize: "0.8rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Wedge pilot · UK → Zimbabwe school fees (first biller type)
        </p>
        <h1
          style={{
            margin: "0.5rem 0 0.75rem",
            fontSize: "1.85rem",
            letterSpacing: "-0.03em",
            lineHeight: 1.2,
          }}
        >
          Prove the right organisation and person got paid.
        </h1>
        <p style={{ margin: 0, color: "var(--muted)", maxWidth: 560 }}>
          Remittance partners move the money. Senda checks the pay is allowed,
          issues a payment reference, and records whether that pay can be
          trusted. First live wedge is school fees; the same pattern is for
          other billers later. Payout accounts:{" "}
          <span className="mono">bank_usd</span> + organisation-owned{" "}
          <span className="mono">ecocash</span>.
        </p>
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            marginTop: "1.25rem",
            flexWrap: "wrap",
          }}
        >
          <Link className="btn" href="/pilot">
            Walk pilot loop
          </Link>
          <Link className="btn btn-ghost" href="/biller">
            Open Biller
          </Link>
          <Link className="btn btn-ghost" href="/dogfood">
            Test loop
          </Link>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        }}
      >
        <div className="panel">
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>Pilot</h2>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem" }}>
            Guided Connect + Biller path for a partner walkthrough: bill →
            instruct (sandbox API key) → confirm → bursar proof. Runbook in{" "}
            <span className="mono">docs/senda-4.0/product/pilot-runbook.md</span>
            .
          </p>
        </div>
        <div className="panel">
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>Connect</h2>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem" }}>
            Partner API key → validate → get pay instructions → confirm. Same
            retry key is safe to retry (no duplicate payment).
          </p>
        </div>
        <div className="panel">
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>Biller</h2>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem" }}>
            Bursar login: open bills, destination checks (verified vs pending),
            payment status, and proof download for the demo organisation.
          </p>
        </div>
      </section>
    </div>
  );
}
