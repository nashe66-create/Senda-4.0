"use client";

import { useMemo, useState } from "react";
import { statusLabel } from "@/lib/ui-labels";

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
      setError("No pay code for the selected amount due");
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

  const recon =
    result &&
    typeof result === "object" &&
    result !== null &&
    "confirm" in result &&
    typeof (result as { confirm?: { recon_result?: string } }).confirm ===
      "object"
      ? (result as { confirm?: { recon_result?: string } }).confirm
          ?.recon_result
      : undefined;

  return (
    <div className="panel" style={{ display: "grid", gap: "1rem" }}>
      {options.length === 0 ? (
        <p style={{ margin: 0, color: "var(--muted)" }}>
          No open amounts due. Run{" "}
          <span className="mono">npm run db:seed</span> in{" "}
          <span className="mono">apps/web</span>.
        </p>
      ) : (
        <>
          <div>
            <label className="label" htmlFor="obl">
              Amount due
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
              Payout account
            </label>
            <select
              id="dest"
              className="select"
              value={destinationType}
              onChange={(e) =>
                setDestinationType(e.target.value as "bank_usd" | "ecocash")
              }
            >
              <option value="bank_usd">Bank USD (demo school FCA)</option>
              <option value="ecocash">EcoCash (organisation merchant)</option>
            </select>
          </div>
          {current && (
            <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem" }}>
              Pay code <span className="mono">{current.linkCode}</span> ·{" "}
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

      {recon && (
        <p style={{ margin: 0, fontSize: "0.95rem" }}>
          Outcome: <strong>{statusLabel(recon)}</strong>
          {recon === "proven" && (
            <span style={{ color: "var(--muted)" }}>
              {" "}
              — test confirmation matched payment reference + amount (not bank
              proof of receipt).
            </span>
          )}
          {recon === "needs_reconcile" && (
            <span style={{ color: "var(--muted)" }}>
              {" "}
              — partner/ops must look.
            </span>
          )}
        </p>
      )}

      {result != null && (
        <div>
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>
            Result (system payload)
          </h2>
          <pre className="pre">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
