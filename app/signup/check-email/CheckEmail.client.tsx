// app/signup/check-email/CheckEmail.client.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

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
    <div className="mx-auto w-full max-w-xl">
      <div className="rounded-[32px] bg-white p-7 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.10)] sm:p-9">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
          <MailIcon className="h-4 w-4" />
          Step 2 of 3
        </div>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">Check your inbox</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          We sent a verification link to{" "}
          <span className="font-semibold text-slate-900">{email || "your email"}</span>.
          Click the link to verify your email and continue.
        </p>

        {/* Progress indicator */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span className="text-emerald-600">✓ Create account</span>
            <span className="text-blue-600">→ Verify email</span>
            <span className="text-slate-400">Connect bank</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
            <div className="h-full rounded-full bg-blue-600 transition" style={{ width: "33%" }} />
          </div>
        </div>

        {sent && (
          <div className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
            ✓ Verification email resent. Check your inbox.
          </div>
        )}
        {err && (
          <div className="mt-6 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-700 ring-1 ring-rose-200">
            {err}
          </div>
        )}

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <div className="text-sm font-semibold text-slate-900">Didn't receive the email?</div>
          <p className="mt-1 text-sm text-slate-600">
            Check your spam folder, or click below to resend.
          </p>
          <button
            onClick={resend}
            disabled={busy || !email}
            className="mt-3 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {busy ? "Resending…" : "Resend verification email"}
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link href="/signup" className="font-semibold text-slate-700 hover:underline">
            ← Back to signup
          </Link>
          <Link href="/login" className="font-semibold text-blue-700 hover:underline">
            Already verified? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
