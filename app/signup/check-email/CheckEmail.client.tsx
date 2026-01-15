// app/signup/check-email/CheckEmail.client.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CheckEmailClient() {
  const sp = useSearchParams();
  const email = sp.get("email") || "";

  const [busy, setBusy] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function resend() {
    setBusy(true);
    setErr(null);
    setSent(false);
    try {
      const r = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j?.message || "Could not resend.");
      setSent(true);
    } catch (e: any) {
      setErr(e?.message || "Could not resend.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg p-8">
      <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
        <h1 className="text-xl font-semibold text-slate-900">Check your inbox</h1>
        <p className="mt-2 text-sm font-medium text-slate-600">
          We sent a verification link to{" "}
          <span className="font-semibold text-slate-900">{email || "your email"}</span>.
        </p>

        {sent && (
          <div className="mt-4 rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
            Verification email resent.
          </div>
        )}
        {err && (
          <div className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">
            {err}
          </div>
        )}

        <div className="mt-5 flex gap-3">
          <button
            onClick={resend}
            disabled={busy || !email}
            className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {busy ? "Resending…" : "Resend email"}
          </button>

          <Link
            href="/login"
            className="rounded-2xl bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200"
          >
            Go to login
          </Link>
        </div>
      </div>
    </div>
  );
}
