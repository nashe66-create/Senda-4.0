"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("bursar@heritage-demo.zw");
  const [password, setPassword] = useState("pilot");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/biller/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message ?? "Login failed");
        return;
      }
      router.push("/biller");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel" style={{ maxWidth: 420 }}>
      <h1 style={{ marginTop: 0, fontSize: "1.35rem" }}>Biller login</h1>
      <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
        Stub auth for M1 (demo school organisation). Fixture:{" "}
        <span className="mono">bursar@heritage-demo.zw</span> /{" "}
        <span className="mono">pilot</span>
      </p>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: "0.9rem" }}>
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
        </div>
        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        {error && (
          <p style={{ color: "var(--danger)", margin: 0, fontSize: "0.9rem" }}>
            {error}
          </p>
        )}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
