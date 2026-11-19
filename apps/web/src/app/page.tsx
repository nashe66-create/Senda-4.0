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
          M1 scaffold · first wedge UK → Zimbabwe school fees
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
          <Link className="btn" href="/dogfood">
            Run test loop
          </Link>
          <Link className="btn btn-ghost" href="/biller">
            Open Biller
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
        <div className="panel">
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>Product</h2>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem" }}>
            Wording map + how it works:{" "}
            <a href="https://github.com/nashe66-create/Senda-4.0/blob/main/docs/senda-4.0/product/connect-concepts.md">
              connect-concepts
            </a>{" "}
            in <span className="mono">docs/senda-4.0/</span>.
          </p>
        </div>
      </section>
    </div>
  );
}
