"use client";

import { useMemo, useState } from "react";
import { statusLabel } from "@/lib/ui-labels";

type Option = {
  obligationId: string;
  linkCode: string;
  label: string;
  amount: string;
};

type DogfoodPath = "happy" | "mismatch";

type ConfirmSlice = {
  recon_result?: string;
  recon_notes?: string | null;
  proof_issued?: boolean;
  instructed?: { amount: string; currency: string };
  confirmed?: { amount: string; currency: string };
};

type DogfoodResult = {
  path?: DogfoodPath;
  path_label?: string;
  confirm?: ConfirmSlice;
  mismatch?: {
    deliberate?: boolean;
    what_differed?: string;
    instructed?: { amount: string; currency: string };
    confirmed?: { amount: string; currency: string };
    note?: string;
  } | null;
  proof?: { id: string; storage_key: string; schema?: string } | null;
  proof_issued?: boolean;
  proof_note?: string;
};

export function DogfoodClient({ options }: { options: Option[] }) {
  const [selected, setSelected] = useState(options[0]?.obligationId ?? "");
  const [destinationType, setDestinationType] = useState<"bank_usd" | "ecocash">(
    "bank_usd",
  );
  const [loading, setLoading] = useState<DogfoodPath | null>(null);
  const [result, setResult] = useState<DogfoodResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const current = useMemo(
    () => options.find((o) => o.obligationId === selected),
    [options, selected],
  );

  async function run(path: DogfoodPath) {
    if (!current?.linkCode) {
      setError("No pay code for the selected amount due");
      return;
    }
    setLoading(path);
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
          path,
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
      setResult(data as DogfoodResult);
    } catch {
      setError("Network error");
    } finally {
      setLoading(null);
    }
  }

  const recon = result?.confirm?.recon_result;
  const isMismatch = result?.path === "mismatch" || recon === "needs_reconcile";
  const instructed =
    result?.mismatch?.instructed ?? result?.confirm?.instructed;
  const confirmed = result?.mismatch?.confirmed ?? result?.confirm?.confirmed;

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
              <option value="bank_usd">Bank USD (demo org FCA)</option>
              <option value="ecocash">EcoCash (organisation merchant)</option>
            </select>
          </div>
          {current && (
            <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem" }}>
              Pay code <span className="mono">{current.linkCode}</span> ·{" "}
              <span className="mono">{current.amount} USD</span>
              <br />
              Same request is safe to retry with the same retry key (no second
              payment).
            </p>
          )}

          <div
            style={{
              display: "grid",
              gap: "0.75rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "0.85rem 1rem",
                display: "grid",
                gap: "0.55rem",
              }}
            >
              <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)" }}>
                Happy path
              </p>
              <p style={{ margin: 0, fontSize: "0.9rem" }}>
                Confirm matches the bill →{" "}
                <strong>{statusLabel("proven")}</strong> + payment proof.
              </p>
              <button
                className="btn"
                type="button"
                onClick={() => run("happy")}
                disabled={loading !== null}
              >
                {loading === "happy" ? "Running…" : "Run happy path"}
              </button>
            </div>

            <div
              style={{
                border: "1px solid #6a5830",
                borderRadius: 6,
                padding: "0.85rem 1rem",
                display: "grid",
                gap: "0.55rem",
                background: "rgba(106, 88, 48, 0.12)",
              }}
            >
              <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--warn)" }}>
                Mismatch path · not the happy path
              </p>
              <p style={{ margin: 0, fontSize: "0.9rem" }}>
                Partner confirmation uses the wrong amount →{" "}
                <strong>{statusLabel("needs_reconcile")}</strong>; no{" "}
                <span className="mono">senda.proof.v1</span>.
              </p>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => run("mismatch")}
                disabled={loading !== null}
                style={{ borderColor: "#6a5830", color: "#e8d5a3" }}
              >
                {loading === "mismatch"
                  ? "Running…"
                  : "Run mismatch (needs a check)"}
              </button>
            </div>
          </div>
        </>
      )}

      {error && (
        <p style={{ color: "var(--danger)", margin: 0, fontSize: "0.9rem" }}>
          {error}
        </p>
      )}

      {result && recon && (
        <div
          className="panel"
          style={{
            margin: 0,
            padding: "1rem",
            borderColor: isMismatch ? "#6a5830" : "var(--accent-soft)",
            background: isMismatch
              ? "rgba(106, 88, 48, 0.15)"
              : "rgba(42, 95, 77, 0.2)",
            display: "grid",
            gap: "0.65rem",
          }}
        >
          <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted)" }}>
            {result.path_label ??
              (isMismatch ? "Mismatch / needs a check" : "Happy path")}
          </p>
          <p style={{ margin: 0, fontSize: "1.05rem" }}>
            Status:{" "}
            <span
              className={`badge ${isMismatch ? "badge-warn" : "badge-ok"}`}
              title={recon}
            >
              {statusLabel(recon)}
            </span>{" "}
            <span className="mono" style={{ color: "var(--muted)" }}>
              ({recon})
            </span>
          </p>

          {instructed && confirmed && (
            <div style={{ fontSize: "0.9rem" }}>
              <p style={{ margin: "0 0 0.35rem", color: "var(--muted)" }}>
                {isMismatch
                  ? "What differed (instructed vs confirmed)"
                  : "Instructed vs confirmed (match)"}
              </p>
              <table className="table" style={{ maxWidth: 420 }}>
                <thead>
                  <tr>
                    <th></th>
                    <th>Amount</th>
                    <th>Currency</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Pay instructions (bill)</td>
                    <td className="mono">{instructed.amount}</td>
                    <td className="mono">{instructed.currency}</td>
                  </tr>
                  <tr>
                    <td>Partner confirmation</td>
                    <td className="mono">{confirmed.amount}</td>
                    <td className="mono">{confirmed.currency}</td>
                  </tr>
                </tbody>
              </table>
              {result.confirm?.recon_notes && (
                <p
                  style={{
                    margin: "0.5rem 0 0",
                    color: "var(--warn)",
                    fontSize: "0.85rem",
                  }}
                >
                  {result.confirm.recon_notes}
                </p>
              )}
            </div>
          )}

          <p style={{ margin: 0, fontSize: "0.9rem" }}>
            Payment proof:{" "}
            {result.proof_issued || result.proof ? (
              <span>
                <span className="badge badge-ok">Issued</span>{" "}
                <span className="mono">senda.proof.v1</span>
                {result.proof?.storage_key && (
                  <>
                    {" "}
                    · <span className="mono">{result.proof.storage_key}</span>
                  </>
                )}
              </span>
            ) : (
              <span>
                <span className="badge badge-warn">Not issued</span> — no{" "}
                <span className="mono">senda.proof.v1</span> for the organisation
                (proof blocked until the check clears).
              </span>
            )}
          </p>
          {result.proof_note && (
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)" }}>
              {result.proof_note}
            </p>
          )}
        </div>
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
