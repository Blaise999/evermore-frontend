// app/forgot-password/ForgotPasswordSteps.client.tsx
"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

// ✅ use your existing API client (DO NOT edit lib/Api.ts)
import { api, ApiError } from "../libs/Api";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function Shield({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none">
      <path
        d="M12 2l8 4v6c0 5.2-3.4 9.9-8 10-4.6-.1-8-4.8-8-10V6l8-4Z"
        className="stroke-current"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-5"
        className="stroke-current"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function inputBase() {
  return "w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40";
}

function StepPill({
  n,
  label,
  active,
  done,
}: {
  n: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1",
        done
          ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
          : active
          ? "bg-blue-50 text-blue-700 ring-blue-100"
          : "bg-white text-slate-600 ring-slate-200"
      )}
    >
      <span
        className={cn(
          "grid h-5 w-5 place-items-center rounded-full text-[11px] ring-1",
          done
            ? "bg-emerald-600 text-white ring-emerald-600"
            : active
            ? "bg-blue-600 text-white ring-blue-600"
            : "bg-slate-100 text-slate-700 ring-slate-200"
        )}
      >
        {n}
      </span>
      {label}
    </div>
  );
}

type Step = 1 | 2 | 3;

type FormState = {
  email: string;
  code: string; // OTP
  password: string;
  password2: string;
};

function validate(step: Step, form: FormState) {
  const e: Record<string, string> = {};
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());

  if (step === 1 && !emailOk) e.email = "Enter a valid email address.";
  if (step === 2 && form.code.trim().length < 4) e.code = "Enter the verification code.";
  if (step === 3) {
    if (form.password.length < 8) e.password = "Password must be at least 8 characters.";
    if (form.password2 !== form.password) e.password2 = "Passwords do not match.";
  }

  return e;
}

export default function ForgotPasswordSteps() {
  const [step, setStep] = useState<Step>(1);
  const [busy, setBusy] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [apiErr, setApiErr] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const [form, setForm] = useState<FormState>({
    email: "",
    code: "",
    password: "",
    password2: "",
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const errors = attempted ? validate(step, form) : {};

  const sendCode = async () => {
    setAttempted(true);
    setApiErr(null);

    const nowErrors = validate(1, form);
    if (nowErrors.email) return;

    setBusy(true);
    try {
      const res = await api.auth.forgotPassword({
        email: form.email.trim().toLowerCase(),
      });

      // Backend intentionally returns the same message regardless (security).
      // debugOtp may exist in dev on your backend; show it only if present.
      const msg = res?.message || "If an account exists for that email, a code has been sent.";
      const debug = (res as any)?.debugOtp ? ` (OTP: ${(res as any).debugOtp})` : "";
      setToast(`${msg}${debug}`);

      setCooldown(45);
      setStep(2);
      setAttempted(false);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setApiErr(err.message || "Failed to send code.");
      } else {
        setApiErr("Failed to send code. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  // NOTE: lib/Api.ts / backend contract only exposes:
  // - forgotPassword(email) -> sends OTP
  // - resetPassword(email, otp, newPassword) -> consumes OTP
  // There's no separate "verify OTP" endpoint in your API client, so step 2
  // just collects OTP and moves to step 3.
  const verifyCode = async () => {
    setAttempted(true);
    setApiErr(null);

    const nowErrors = validate(2, form);
    if (nowErrors.code) return;

    setBusy(true);
    try {
      setToast("Code captured. Create a new password.");
      setStep(3);
      setAttempted(false);
    } finally {
      setBusy(false);
    }
  };

  const setNewPassword = async () => {
    setAttempted(true);
    setApiErr(null);

    const nowErrors = validate(3, form);
    if (nowErrors.password || nowErrors.password2) return;

    setBusy(true);
    try {
      const res = await api.auth.resetPassword({
        email: form.email.trim().toLowerCase(),
        otp: form.code.trim(),
        newPassword: form.password,
      });

      setToast(res?.message || "Password updated. You can login now.");
      setStep(1);
      setForm({ email: "", code: "", password: "", password2: "" });
      setAttempted(false);
      setCooldown(0);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setApiErr(err.message || "Failed to update password.");
      } else {
        setApiErr("Failed to update password. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (cooldown > 0 || busy) return;
    await sendCode();
  };

  return (
    <div className="rounded-[32px] bg-white p-6 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.10)] sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-500">Patient Portal</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            Forgot password
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Follow the steps below to regain access to your Evermore account.
          </p>
        </div>

        <div className="hidden sm:flex flex-col items-end gap-2">
          <div className="flex flex-wrap gap-2">
            <StepPill n={1} label="Email" active={step === 1} done={step > 1} />
            <StepPill n={2} label="Verify" active={step === 2} done={step > 2} />
            <StepPill n={3} label="New password" active={step === 3} done={false} />
          </div>
        </div>
      </div>

      {/* ✅ API error banner */}
      {apiErr ? (
        <div className="mt-6 rounded-3xl bg-rose-50 p-4 ring-1 ring-rose-200">
          <div className="text-sm font-semibold text-rose-700">{apiErr}</div>
          <button
            onClick={() => setApiErr(null)}
            className="mt-2 text-xs font-semibold text-rose-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {toast ? (
        <div className="mt-6 rounded-3xl bg-blue-50 p-4 ring-1 ring-blue-100">
          <div className="text-sm font-semibold text-slate-900">{toast}</div>
          <button
            onClick={() => setToast(null)}
            className="mt-2 text-xs font-semibold text-blue-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="mt-7 space-y-5">
        {step === 1 ? (
          <>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-900">Email address</label>
              <input
                className={inputBase()}
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                placeholder="you@example.com"
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                spellCheck={false}
              />
              {attempted && errors.email ? (
                <div className="text-xs font-semibold text-rose-600">{errors.email}</div>
              ) : null}
              <div className="text-xs text-slate-600">
                We’ll send a code if an account exists for this email.
              </div>
            </div>

            <button
              onClick={sendCode}
              disabled={busy}
              className={cn(
                "w-full rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(37,99,235,.24)] transition hover:bg-blue-700 active:translate-y-[1px]",
                busy && "opacity-80 cursor-not-allowed"
              )}
            >
              {busy ? "Sending..." : "Send verification code"}
            </button>

            <div className="flex items-center justify-between text-sm">
              <Link
                href="/login"
                prefetch={false}
                className="font-semibold text-slate-700 hover:underline"
              >
                Back to login
              </Link>
              <Link
                href="/signup"
                prefetch={false}
                className="font-semibold text-blue-700 hover:underline"
              >
                Create account
              </Link>
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-900">Verification code</label>
              <input
                className={inputBase()}
                value={form.code}
                onChange={(e) => setForm((s) => ({ ...s, code: e.target.value }))}
                placeholder="Enter code"
                inputMode="numeric"
                autoComplete="one-time-code"
              />
              {attempted && errors.code ? (
                <div className="text-xs font-semibold text-rose-600">{errors.code}</div>
              ) : null}
              <div className="text-xs text-slate-600">
                Sent to:{" "}
                <span className="font-semibold text-slate-900">{form.email || "your email"}</span>
              </div>
            </div>

            <button
              onClick={verifyCode}
              disabled={busy}
              className={cn(
                "w-full rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(37,99,235,.24)] transition hover:bg-blue-700 active:translate-y-[1px]",
                busy && "opacity-80 cursor-not-allowed"
              )}
            >
              {busy ? "Continuing..." : "Continue"}
            </button>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => {
                  setStep(1);
                  setAttempted(false);
                  setApiErr(null);
                }}
                className="text-sm font-semibold text-slate-700 hover:underline"
              >
                Change email
              </button>

              <button
                onClick={resend}
                disabled={cooldown > 0 || busy}
                className={cn(
                  "text-sm font-semibold text-blue-700 hover:underline",
                  (cooldown > 0 || busy) && "opacity-60 cursor-not-allowed"
                )}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
              </button>
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-900">New password</label>
              <input
                className={inputBase()}
                value={form.password}
                onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                placeholder="8+ characters"
                type="password"
                autoComplete="new-password"
              />
              {attempted && errors.password ? (
                <div className="text-xs font-semibold text-rose-600">{errors.password}</div>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-900">Confirm new password</label>
              <input
                className={inputBase()}
                value={form.password2}
                onChange={(e) => setForm((s) => ({ ...s, password2: e.target.value }))}
                placeholder="Re-enter password"
                type="password"
                autoComplete="new-password"
              />
              {attempted && errors.password2 ? (
                <div className="text-xs font-semibold text-rose-600">{errors.password2}</div>
              ) : null}
            </div>

            <button
              onClick={setNewPassword}
              disabled={busy}
              className={cn(
                "w-full rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(37,99,235,.24)] transition hover:bg-blue-700 active:translate-y-[1px]",
                busy && "opacity-80 cursor-not-allowed"
              )}
            >
              {busy ? "Updating..." : "Update password"}
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                onClick={() => {
                  setStep(2);
                  setAttempted(false);
                  setApiErr(null);
                }}
                className="font-semibold text-slate-700 hover:underline"
              >
                Back
              </button>
              <Link
                href="/login"
                prefetch={false}
                className="font-semibold text-blue-700 hover:underline"
              >
                Go to login
              </Link>
            </div>
          </>
        ) : null}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <Shield className="h-4 w-4 text-blue-700" />
          Secure access to sensitive health information
        </div>
        <Link
          href="/emergency"
          prefetch={false}
          className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50"
        >
          Emergency info
        </Link>
      </div>
    </div>
  );
}
