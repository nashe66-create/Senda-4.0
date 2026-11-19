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
          M1 scaffold · UK → Zimbabwe school fees
        </p>
        <h1
          style={{
            margin: "0.5rem 0 0.75rem",
            fontSize: "1.85rem",
            letterSpacing: "-0.03em",
            lineHeight: 1.2,
          }}
        >
          Prove the right school and student got paid.
        </h1>
        <p style={{ margin: 0, color: "var(--muted)", maxWidth: 560 }}>
          Partners move the money. Senda owns Links, refs, validation, recon,
          and proof. Connect destinations:{" "}
          <span className="mono">bank_usd</span> + school-owned{" "}
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
            Run dogfood loop
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
            Partner API key →{" "}
            <span className="mono">/api/v1/connect/validate</span> → instruct →
            confirm (idempotent).
          </p>
        </div>
        <div className="panel">
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>Biller</h2>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem" }}>
            School stub login. List obligations, attempts, and proofs for the
            pilot fixture school.
          </p>
        </div>
        <div className="panel">
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>Product</h2>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem" }}>
            Spec:{" "}
            <a href="https://github.com/nashe66-create/Senda-4.0/blob/main/docs/senda-4.0/product/how-it-works.md">
              how-it-works
            </a>{" "}
            in <span className="mono">docs/senda-4.0/</span>.
          </p>
        </div>
      </section>
    </div>
  );
}
