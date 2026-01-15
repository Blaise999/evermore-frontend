// app/verify-email/pending/VerifyEmailPending.client.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React from "react";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

async function resend(email: string) {
  const r = await fetch("/api/auth/resend-verification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ email }),
  });

  if (!r.ok) {
    let msg = "Could not resend verification email. Try again.";
    try {
      const j = await r.json();
      if (j?.message) msg = String(j.message);
    } catch {}
    throw new Error(msg);
  }
  return true;
}

export default function VerifyEmailPendingClient() {
  const sp = useSearchParams();
  const email = String(sp.get("email") || "").trim();

  const [busy, setBusy] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [cooldown, setCooldown] = React.useState(0);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  async function onResend() {
    if (!email) return;
    setBusy(true);
    setErr(null);
    setSent(false);
    try {
      await resend(email);
      setSent(true);
      setCooldown(60);
    } catch (e: any) {
      setErr(e?.message || "Could not resend verification email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="rounded-[32px] bg-white p-7 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.10)] sm:p-9">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
          Verification required
        </div>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">Check your email</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          We sent a verification link to{" "}
          <span className="font-semibold text-slate-900">{email || "your email address"}</span>.
          <br />
          Click the link to verify your account, then come back and log in.
        </p>

        <div className="mt-6 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <div className="text-sm font-semibold text-slate-900">Didn’t see it?</div>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            <li>• Check your spam/junk folder</li>
            <li>• Search your inbox for “Evermore”</li>
            <li>• Wait 1–2 minutes (some providers delay)</li>
          </ul>
        </div>

        {err ? (
          <div className="mt-5 rounded-3xl bg-rose-50 p-4 text-sm font-semibold text-rose-700 ring-1 ring-rose-200">
            {err}
          </div>
        ) : null}

        {sent ? (
          <div className="mt-5 rounded-3xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
            Verification email sent. Please check your inbox.
          </div>
        ) : null}

        <div className="mt-6 grid gap-3">
          <button
            disabled={!email || busy || cooldown > 0}
            onClick={onResend}
            className={cn(
              "w-full rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(37,99,235,.24)] transition hover:bg-blue-700 active:translate-y-[1px]",
              (!email || busy || cooldown > 0) && "opacity-70 cursor-not-allowed"
            )}
          >
            {cooldown > 0 ? `Resend available in ${cooldown}s` : busy ? "Resending…" : "Resend verification email"}
          </button>

          <Link
            href="/login"
            className="w-full rounded-2xl bg-white px-6 py-3.5 text-center text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Continue to login
          </Link>

          <div className="text-center text-sm text-slate-600">
            Used the wrong email?{" "}
            <Link href="/signup" className="font-semibold text-blue-700 hover:underline">
              Create account again
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-5 text-center text-xs font-medium text-slate-500">
        By continuing, you agree to Evermore’s{" "}
        <Link href="/terms" className="font-semibold text-slate-700 hover:underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="font-semibold text-slate-700 hover:underline">
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  );
}
