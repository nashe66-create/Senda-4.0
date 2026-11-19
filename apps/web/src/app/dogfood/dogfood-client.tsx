"use client";

import { useMemo, useState } from "react";

type Option = {
  obligationId: string;
  linkCode: string;
  label: string;
  amount: string;
};

export function DogfoodClient({ options }: { options: Option[] }) {
  const [selected, setSelected] = useState(options[0]?.obligationId ?? "");
  const [destinationType, setDestinationType] = useState<"bank_usd" | "ecocash">(
    "bank_usd",
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  const current = useMemo(
    () => options.find((o) => o.obligationId === selected),
    [options, selected],
  );

  async function run() {
    if (!current?.linkCode) {
      setError("No link for selected obligation");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/v1/dogfood/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          link_code: current.linkCode,
          obligation_id: current.obligationId,
          destination_type: destinationType,
          amount: current.amount,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data?.error
            ? `${data.error.code}: ${data.error.message}`
            : "Request failed",
        );
        setResult(data);
        return;
      }
      setResult(data);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel" style={{ display: "grid", gap: "1rem" }}>
      {options.length === 0 ? (
        <p style={{ margin: 0, color: "var(--muted)" }}>
          No open obligations. Run <span className="mono">npm run db:seed</span>{" "}
          in <span className="mono">apps/web</span>.
        </p>
      ) : (
        <>
          <div>
            <label className="label" htmlFor="obl">
              Obligation
            </label>
            <select
              id="obl"
              className="select"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {options.map((o) => (
                <option key={o.obligationId} value={o.obligationId}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="dest">
              Settle destination
            </label>
            <select
              id="dest"
              className="select"
              value={destinationType}
              onChange={(e) =>
                setDestinationType(e.target.value as "bank_usd" | "ecocash")
              }
            >
              <option value="bank_usd">bank_usd (Steward FCA)</option>
              <option value="ecocash">ecocash (school merchant)</option>
            </select>
          </div>
          {current && (
            <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem" }}>
              Link <span className="mono">{current.linkCode}</span> · amount{" "}
              <span className="mono">{current.amount} USD</span>
            </p>
          )}
          <button className="btn" type="button" onClick={run} disabled={loading}>
            {loading ? "Running…" : "Run happy path"}
          </button>
        </>
      )}

      {error && (
        <p style={{ color: "var(--danger)", margin: 0, fontSize: "0.9rem" }}>
          {error}
        </p>
      )}

      {result != null && (
        <div>
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>Result</h2>
          <pre className="pre">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
