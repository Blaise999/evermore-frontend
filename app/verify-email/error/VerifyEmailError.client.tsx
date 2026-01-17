// app/verify-email/error/VerifyEmailError.client.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React from "react";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

const REASON_MESSAGES: Record<string, { title: string; message: string }> = {
  expired: {
    title: "Verification link expired",
    message: "This verification link has expired. Please request a new one below.",
  },
  invalid: {
    title: "Invalid verification link",
    message: "This verification link is invalid. It may have already been used or doesn't exist.",
  },
  duplicate: {
    title: "Email already registered",
    message: "This email address is already registered. You can sign in instead, or use a different email to create a new account.",
  },
  default: {
    title: "Verification failed",
    message: "Something went wrong with the verification. Please try again.",
  },
};

export default function VerifyEmailErrorClient() {
  const sp = useSearchParams();
  const reasonCode = sp.get("reason") || "default";
  const reasonData = REASON_MESSAGES[reasonCode] || REASON_MESSAGES.default;

  const [email, setEmail] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [ok, setOk] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  // Don't show resend form for duplicate emails
  const showResendForm = reasonCode !== "duplicate";

  async function resend() {
    setBusy(true);
    setErr(null);
    setOk(false);
    try {
      const r = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (!r.ok) {
        let msg = "Could not resend verification email. Try again.";
        try {
          const j = await r.json();
          if (j?.message) msg = String(j.message);
        } catch {}
        throw new Error(msg);
      }

      setOk(true);
    } catch (e: any) {
      setErr(e?.message || "Could not resend verification email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="rounded-[32px] bg-white p-7 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.10)] sm:p-9">
        <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Verification failed
        </div>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">{reasonData.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{reasonData.message}</p>

        {showResendForm ? (
          <div className="mt-6 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <div className="text-sm font-semibold text-slate-900">Resend a new link</div>
            <p className="mt-1 text-sm text-slate-600">Enter your email and we'll send you a fresh verification link.</p>

            <div className="mt-3 grid gap-3">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                inputMode="email"
                autoComplete="email"
              />

              {err ? (
                <div className="rounded-3xl bg-rose-50 p-4 text-sm font-semibold text-rose-700 ring-1 ring-rose-200">
                  {err}
                </div>
              ) : null}

              {ok ? (
                <div className="rounded-3xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
                  If the email exists, a new verification link has been sent.
                </div>
              ) : null}

              <button
                disabled={busy || email.trim().length < 5}
                onClick={resend}
                className={cn(
                  "w-full rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(37,99,235,.24)] transition hover:bg-blue-700 active:translate-y-[1px]",
                  (busy || email.trim().length < 5) && "opacity-70 cursor-not-allowed"
                )}
              >
                {busy ? "Sending…" : "Resend verification email"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-3xl bg-blue-50 p-4 ring-1 ring-blue-100">
            <div className="text-sm font-semibold text-blue-900">Already have an account?</div>
            <p className="mt-1 text-sm text-blue-700">
              If you already verified your email, you can sign in to your account.
            </p>
            <Link
              href="/login"
              className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Sign in to your account
            </Link>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link href="/login" className="font-semibold text-blue-700 hover:underline">
            Back to login
          </Link>
          <Link href="/signup" className="font-semibold text-slate-700 hover:underline">
            Create a new account
          </Link>
        </div>
      </div>
    </div>
  );
}
