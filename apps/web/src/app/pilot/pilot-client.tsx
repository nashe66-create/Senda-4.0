"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { statusLabel } from "@/lib/ui-labels";

type Bill = {
  obligationId: string;
  linkCode: string;
  who: string;
  orgName: string;
  label: string;
  amount: string;
  currency: string;
};

type Checklist = {
  organisationName: string;
  kybVerified: boolean;
  liveConnect: boolean;
  verifiedDestinations: number;
  destinationCount: number;
  openBills: number;
  partnerKeyHint: string;
  bursarEmail: string;
};

type Step = 1 | 2 | 3 | 4;

type InstructResult = {
  attempt_id: string;
  customer_reference: string;
  amount: string;
  currency: string;
  status: string;
  destination?: Record<string, unknown>;
  replayed?: boolean;
};

type ConfirmResult = {
  attempt_id: string;
  status: string;
  recon_result: string;
  recon_notes?: string | null;
  proof_issued?: boolean;
  proof_id?: string | null;
  storage_key?: string | null;
  instructed?: { amount: string; currency: string };
  confirmed?: { amount: string; currency: string };
  customer_reference?: string;
};

type HandoffResult = {
  status: string;
  status_label: string;
  proof_issued: boolean;
  recon_notes?: string | null;
  payment_reference?: string | null;
  bursar?: {
    biller_path: string;
    payments_anchor: string;
    needs_check_anchor: string;
    proof_download_path: string | null;
    demo_email: string;
    note: string;
  };
  sandbox_note?: string;
};

async function connectFetch(
  path: string,
  apiKey: string,
  body: Record<string, unknown>,
) {
  const res = await fetch(path, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { res, data };
}

export function PilotClient({
  bills,
  sandboxApiKey,
  checklist,
}: {
  bills: Bill[];
  sandboxApiKey: string;
  checklist: Checklist;
}) {
  const [step, setStep] = useState<Step>(1);
  const [selected, setSelected] = useState(bills[0]?.obligationId ?? "");
  const [destinationType, setDestinationType] = useState<"bank_usd" | "ecocash">(
    "bank_usd",
  );
  const [apiKey, setApiKey] = useState(sandboxApiKey);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validateOut, setValidateOut] = useState<unknown>(null);
  const [instructOut, setInstructOut] = useState<InstructResult | null>(null);
  const [confirmOut, setConfirmOut] = useState<ConfirmResult | null>(null);
  const [handoff, setHandoff] = useState<HandoffResult | null>(null);
  const [confirmPath, setConfirmPath] = useState<"happy" | "mismatch" | null>(
    null,
  );

  const current = useMemo(
    () => bills.find((b) => b.obligationId === selected),
    [bills, selected],
  );

  const checklistReady =
    checklist.kybVerified &&
    checklist.liveConnect &&
    checklist.verifiedDestinations > 0 &&
    checklist.openBills > 0;

  async function runInstruct() {
    if (!current?.linkCode) {
      setError("No pay code for the selected bill. Re-seed the demo fixture.");
      return;
    }
    setLoading("instruct");
    setError(null);
    setValidateOut(null);
    setInstructOut(null);
    setConfirmOut(null);
    setHandoff(null);
    setConfirmPath(null);
    try {
      const validate = await connectFetch("/api/v1/connect/validate", apiKey, {
        link_code: current.linkCode,
        obligation_id: current.obligationId,
        amount: current.amount,
        destination_type: destinationType,
      });
      setValidateOut(validate.data);
      if (!validate.res.ok) {
        setError(
          validate.data?.error
            ? `${validate.data.error.code}: ${validate.data.error.message}`
            : "Validate failed",
        );
        return;
      }

      const retryKey = `pilot-ui-${current.obligationId}-${Date.now()}`;
      const instruct = await connectFetch("/api/v1/connect/instruct", apiKey, {
        link_code: current.linkCode,
        obligation_id: current.obligationId,
        amount: current.amount,
        destination_type: destinationType,
        retry_key: retryKey,
      });
      if (!instruct.res.ok) {
        setError(
          instruct.data?.error
            ? `${instruct.data.error.code}: ${instruct.data.error.message}`
            : "Instruct failed",
        );
        setInstructOut(instruct.data);
        return;
      }
      setInstructOut(instruct.data as InstructResult);
      setStep(3);
    } catch {
      setError("Network error calling Connect");
    } finally {
      setLoading(null);
    }
  }

  async function runConfirm(path: "happy" | "mismatch") {
    if (!instructOut) {
      setError("Get pay instructions first.");
      return;
    }
    setLoading(path);
    setError(null);
    setConfirmOut(null);
    setHandoff(null);
    setConfirmPath(path);
    try {
      const confirmAmount =
        path === "mismatch"
          ? (Number(instructOut.amount) - 50).toFixed(2)
          : instructOut.amount;

      const confirm = await connectFetch("/api/v1/connect/confirm", apiKey, {
        attempt_id: instructOut.attempt_id,
        customer_reference: instructOut.customer_reference,
        amount: confirmAmount,
        currency: instructOut.currency,
        partner_payment_id: `PILOT-UI-${path.toUpperCase()}-${Date.now()}`,
      });
      if (!confirm.res.ok) {
        setError(
          confirm.data?.error
            ? `${confirm.data.error.code}: ${confirm.data.error.message}`
            : "Confirm failed",
        );
        setConfirmOut(confirm.data);
        return;
      }
      setConfirmOut(confirm.data as ConfirmResult);

      const handoffRes = await fetch(
        `/api/v1/pilot/handoff?attempt_id=${encodeURIComponent(instructOut.attempt_id)}`,
      );
      const handoffData = await handoffRes.json();
      if (handoffRes.ok) {
        setHandoff(handoffData as HandoffResult);
      }
      setStep(4);
    } catch {
      setError("Network error on confirm / handoff");
    } finally {
      setLoading(null);
    }
  }

  const recon = confirmOut?.recon_result;
  const isMismatch = recon === "needs_reconcile" || confirmPath === "mismatch";

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {/* Onboarding strip */}
      <section
        className="panel"
        style={{
          borderColor: checklistReady ? "var(--accent-soft)" : "#6a5830",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "0.75rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "1.05rem" }}>
              Onboarding checklist
            </h2>
            <p
              style={{
                margin: "0.35rem 0 0",
                color: "var(--muted)",
                fontSize: "0.9rem",
              }}
            >
              {checklist.organisationName} · partner key{" "}
              <span className="mono">{checklist.partnerKeyHint}</span>
            </p>
          </div>
          <span
            className={`badge ${checklistReady ? "badge-ok" : "badge-warn"}`}
          >
            {checklistReady ? "Ready to walk" : "Seed / fix first"}
          </span>
        </div>
        <ul
          style={{
            margin: "0.85rem 0 0",
            paddingLeft: "1.1rem",
            color: "var(--muted)",
            fontSize: "0.85rem",
            display: "grid",
            gap: "0.3rem",
          }}
        >
          <li>
            Organisation checks:{" "}
            {checklist.kybVerified ? "verified" : "pending"} · Live on Connect:{" "}
            {checklist.liveConnect ? "yes" : "no"}
          </li>
          <li>
            Payout accounts verified: {checklist.verifiedDestinations}/
            {checklist.destinationCount} (Bank USD / org EcoCash)
          </li>
          <li>
            Open bills with pay codes: {checklist.openBills} · Bursar:{" "}
            <span className="mono">{checklist.bursarEmail}</span> /{" "}
            <span className="mono">pilot</span>
          </li>
        </ul>
      </section>

      {/* Steps */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
          fontSize: "0.8rem",
        }}
      >
        {(
          [
            [1, "Pick bill"],
            [2, "Pay instructions"],
            [3, "Confirm"],
            [4, "Bursar proof"],
          ] as const
        ).map(([n, label]) => (
          <span
            key={n}
            className={`badge ${step === n ? "badge-ok" : "badge-muted"}`}
            style={{ opacity: step >= n ? 1 : 0.55 }}
          >
            {n}. {label}
          </span>
        ))}
      </div>

      {/* Step 1–2: pick + instruct */}
      <section className="panel" style={{ display: "grid", gap: "0.85rem" }}>
        <h2 style={{ margin: 0, fontSize: "1.05rem" }}>
          1–2 · Pick bill → Connect instruct
        </h2>
        <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem" }}>
          Uses the sandbox partner API key on{" "}
          <span className="mono">/api/v1/connect/*</span> (same as a real
          partner integration).
        </p>

        {bills.length === 0 ? (
          <p style={{ margin: 0, color: "var(--muted)" }}>
            No open bills. Run{" "}
            <span className="mono">npm run db:seed</span> in{" "}
            <span className="mono">apps/web</span>.
          </p>
        ) : (
          <>
            <div>
              <label className="label" htmlFor="pilot-bill">
                Amount due
              </label>
              <select
                id="pilot-bill"
                className="select"
                value={selected}
                onChange={(e) => {
                  setSelected(e.target.value);
                  setStep(1);
                  setInstructOut(null);
                  setConfirmOut(null);
                  setHandoff(null);
                }}
              >
                {bills.map((b) => (
                  <option key={b.obligationId} value={b.obligationId}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="pilot-dest">
                Payout account
              </label>
              <select
                id="pilot-dest"
                className="select"
                value={destinationType}
                onChange={(e) =>
                  setDestinationType(e.target.value as "bank_usd" | "ecocash")
                }
              >
                <option value="bank_usd">Bank USD</option>
                <option value="ecocash">EcoCash (organisation)</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="pilot-key">
                Partner sandbox API key
              </label>
              <input
                id="pilot-key"
                className="select"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
              <p
                style={{
                  margin: "0.35rem 0 0",
                  color: "var(--muted)",
                  fontSize: "0.8rem",
                }}
              >
                Sent as <span className="mono">Authorization: Bearer …</span> —
                demo only.
              </p>
            </div>
            {current && (
              <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem" }}>
                Pay code <span className="mono">{current.linkCode}</span> ·{" "}
                <span className="mono">
                  {current.amount} {current.currency}
                </span>{" "}
                · {current.orgName}
              </p>
            )}
            <button
              className="btn"
              type="button"
              onClick={() => {
                setStep(2);
                void runInstruct();
              }}
              disabled={loading !== null || !checklistReady}
            >
              {loading === "instruct"
                ? "Calling Connect…"
                : "Get pay instructions"}
            </button>
          </>
        )}

        {validateOut != null && (
          <details>
            <summary style={{ cursor: "pointer", color: "var(--muted)" }}>
              Validate response
            </summary>
            <pre className="pre">{JSON.stringify(validateOut, null, 2)}</pre>
          </details>
        )}

        {instructOut && (
          <div
            style={{
              padding: "0.85rem 1rem",
              borderRadius: 6,
              border: "1px solid var(--accent-soft)",
              background: "rgba(42, 95, 77, 0.15)",
              display: "grid",
              gap: "0.35rem",
              fontSize: "0.9rem",
            }}
          >
            <strong>Pay instructions ready</strong>
            <span>
              Payment reference:{" "}
              <span className="mono">{instructOut.customer_reference}</span>
            </span>
            <span>
              Payment id:{" "}
              <span className="mono">{instructOut.attempt_id}</span>
            </span>
            <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
              Partner settles <em>off Senda</em> to the frozen payout account,
              then confirms below (sandbox stub).
            </span>
          </div>
        )}
      </section>

      {/* Step 3: confirm */}
      <section
        className="panel"
        style={{
          display: "grid",
          gap: "0.85rem",
          opacity: instructOut ? 1 : 0.55,
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.05rem" }}>
          3 · Sandbox partner confirm
        </h2>
        <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem" }}>
          Clearly labeled stub: posts to Connect confirm with the sandbox key.
          This is <strong>not</strong> a production MTO webhook or bank feed.
        </p>
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
              Matching amount → <strong>{statusLabel("proven")}</strong> +
              payment proof.
            </p>
            <button
              className="btn"
              type="button"
              disabled={!instructOut || loading !== null}
              onClick={() => void runConfirm("happy")}
            >
              {loading === "happy" ? "Confirming…" : "Confirm (match)"}
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
              Mismatch
            </p>
            <p style={{ margin: 0, fontSize: "0.9rem" }}>
              Wrong amount → <strong>{statusLabel("needs_reconcile")}</strong>;
              no proof.
            </p>
            <button
              className="btn btn-ghost"
              type="button"
              disabled={!instructOut || loading !== null}
              onClick={() => void runConfirm("mismatch")}
              style={{ borderColor: "#6a5830", color: "#e8d5a3" }}
            >
              {loading === "mismatch"
                ? "Confirming…"
                : "Confirm with wrong amount"}
            </button>
          </div>
        </div>
      </section>

      {error && (
        <p style={{ color: "var(--danger)", margin: 0, fontSize: "0.9rem" }}>
          {error}
        </p>
      )}

      {/* Step 4: bursar handoff */}
      {(confirmOut || handoff) && (
        <section
          className="panel"
          style={{
            display: "grid",
            gap: "0.75rem",
            borderColor: isMismatch ? "#6a5830" : "var(--accent-soft)",
            background: isMismatch
              ? "rgba(106, 88, 48, 0.15)"
              : "rgba(42, 95, 77, 0.2)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.05rem" }}>
            4 · Bursar-side status / proof
          </h2>
          {recon && (
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
          )}
          {confirmOut?.instructed && confirmOut?.confirmed && (
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
                  <td>Pay instructions</td>
                  <td className="mono">{confirmOut.instructed.amount}</td>
                  <td className="mono">{confirmOut.instructed.currency}</td>
                </tr>
                <tr>
                  <td>Sandbox confirm</td>
                  <td className="mono">{confirmOut.confirmed.amount}</td>
                  <td className="mono">{confirmOut.confirmed.currency}</td>
                </tr>
              </tbody>
            </table>
          )}
          {confirmOut?.recon_notes && (
            <p style={{ margin: 0, color: "var(--warn)", fontSize: "0.85rem" }}>
              {confirmOut.recon_notes}
            </p>
          )}
          <p style={{ margin: 0, fontSize: "0.9rem" }}>
            Payment proof:{" "}
            {confirmOut?.proof_issued || handoff?.proof_issued ? (
              <span>
                <span className="badge badge-ok">Issued</span>{" "}
                <span className="mono">senda.proof.v1</span>
                {confirmOut?.storage_key && (
                  <>
                    {" "}
                    · <span className="mono">{confirmOut.storage_key}</span>
                  </>
                )}
              </span>
            ) : (
              <span>
                <span className="badge badge-warn">Not issued</span> — bursar
                sees needs a check, no download.
              </span>
            )}
          </p>
          {handoff?.bursar && (
            <div
              style={{
                display: "grid",
                gap: "0.5rem",
                fontSize: "0.9rem",
              }}
            >
              <p style={{ margin: 0, color: "var(--muted)" }}>
                {handoff.bursar.note}
              </p>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <Link className="btn" href="/login">
                  Bursar login
                </Link>
                <Link
                  className="btn btn-ghost"
                  href={
                    isMismatch
                      ? handoff.bursar.needs_check_anchor
                      : handoff.bursar.payments_anchor
                  }
                >
                  Open Biller
                </Link>
                {handoff.bursar.proof_download_path && (
                  <a className="btn btn-ghost" href={handoff.bursar.proof_download_path}>
                    Proof download (after login)
                  </a>
                )}
              </div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted)" }}>
                Demo: <span className="mono">{handoff.bursar.demo_email}</span> /{" "}
                <span className="mono">pilot</span>
              </p>
            </div>
          )}
          {handoff?.sandbox_note && (
            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted)" }}>
              {handoff.sandbox_note}
            </p>
          )}
        </section>
      )}

      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)" }}>
        Prefer curl?{" "}
        <span className="mono">
          bash docs/senda-4.0/product/scripts/pilot-loop.sh
        </span>{" "}
        · Full runbook in{" "}
        <span className="mono">docs/senda-4.0/product/pilot-runbook.md</span> ·
        Engineering one-click: <Link href="/dogfood">/dogfood</Link>
      </p>
    </div>
  );
}
