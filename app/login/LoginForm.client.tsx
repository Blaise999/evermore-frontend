// app/login/LoginForm.client.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

// ✅ use your existing API client (DO NOT edit lib/Api.ts)
import { api, ApiError } from "../libs/Api";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function Eye({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none">
      <path
        d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7S2.5 12 2.5 12Z"
        className="stroke-current"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
        className="stroke-current"
        strokeWidth="1.7"
      />
    </svg>
  );
}
function EyeOff({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none">
      <path
        d="M3 3l18 18"
        className="stroke-current"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M10.7 10.7a2.7 2.7 0 0 0 3.6 3.6"
        className="stroke-current"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M6.1 6.6C3.8 8.4 2.5 12 2.5 12s3.5 7 9.5 7c1.8 0 3.4-.5 4.8-1.2"
        className="stroke-current"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 5.4A10.3 10.3 0 0 1 12 5c6 0 9.5 7 9.5 7a16.6 16.6 0 0 1-2.4 3.4"
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

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-end justify-between gap-3">
        <label className="text-sm font-semibold text-slate-900">{label}</label>
        {hint ? <div className="text-xs font-medium text-slate-500">{hint}</div> : null}
      </div>
      {children}
      {error ? <div className="text-xs font-semibold text-rose-600">{error}</div> : null}
    </div>
  );
}

type LoginState = {
  email: string;
  password: string;
  remember: boolean;
};

function validate(form: LoginState) {
  const e: Record<string, string> = {};
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  if (!emailOk) e.email = "Enter a valid email address.";
  if (form.password.length < 1) e.password = "Enter your password.";
  return e;
}

// ✅ cookie helper (no localStorage)
function setSessionTokenCookie(token: string, remember: boolean) {
  const base = `evm_token=${encodeURIComponent(token)}; Path=/; SameSite=Lax`;
  // If remember=false, session cookie (no Max-Age)
  if (!remember) {
    document.cookie = base;
    return;
  }
  // 7 days
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `${base}; Max-Age=${maxAge}`;
}

export default function LoginForm() {
  const router = useRouter();

  const [showPw, setShowPw] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [apiErr, setApiErr] = useState<string | null>(null);

  const [form, setForm] = useState<LoginState>({
    email: "",
    password: "",
    remember: true,
  });

  // Only compute errors after first attempt (snappy typing)
  const errors = useMemo(() => {
    if (!attempted) return {};
    return validate(form);
  }, [attempted, form]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    setApiErr(null);

    // ✅ re-validate here (never rely on possibly stale memo)
    const nowErrors = validate(form);
    if (Object.keys(nowErrors).length) return;

    setBusy(true);
    try {
      const res = await api.auth.login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (res?.token) setSessionTokenCookie(res.token, form.remember);

      router.push("/dashboard");
    } catch (err: any) {
      if (err instanceof ApiError) {
        setApiErr(err.message || "Login failed.");
      } else {
        setApiErr("Login failed. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-[32px] bg-white p-6 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.10)] sm:p-8">
      <div>
        <div className="text-xs font-semibold text-slate-500">Patient Portal</div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Login</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Use your email and password to access your Evermore account.
        </p>
      </div>

      {/* ✅ API error banner */}
      {apiErr ? (
        <div className="mt-6 rounded-3xl bg-rose-50 p-4 text-sm font-semibold text-rose-700 ring-1 ring-rose-200">
          {apiErr}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-7 space-y-5">
        <Field label="Email address" error={(errors as any).email}>
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
        </Field>

        <Field
          label="Password"
          hint={
            <Link href="/forgot-password" prefetch={false} className="text-blue-700 hover:underline">
              Forgot password?
            </Link>
          }
          error={(errors as any).password}
        >
          <div className="relative">
            <input
              className={cn(inputBase(), "pr-12")}
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              placeholder="Enter your password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-600 hover:bg-slate-50"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff /> : <Eye />}
            </button>
          </div>
        </Field>

        <label className="flex items-center gap-3 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <input
            type="checkbox"
            checked={form.remember}
            onChange={(e) => setForm((s) => ({ ...s, remember: e.target.checked }))}
            className="h-4 w-4 rounded border-slate-300"
          />
          <div className="text-sm font-semibold text-slate-700">Keep me logged in on this device</div>
        </label>

        <button
          type="submit"
          disabled={busy}
          className={cn(
            "w-full rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(37,99,235,.24)] transition hover:bg-blue-700 active:translate-y-[1px]",
            busy && "cursor-not-allowed opacity-80"
          )}
        >
          {busy ? "Signing in..." : "Login"}
        </button>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <div className="text-slate-600">
            Don’t have an account?{" "}
            <Link href="/signup" prefetch={false} className="font-semibold text-blue-700 hover:underline">
              Create account
            </Link>
          </div>
          <Link href="/help" prefetch={false} className="font-semibold text-slate-700 hover:underline">
            Need help?
          </Link>
        </div>
      </form>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
        <div className="text-xs font-semibold text-slate-600">Secure access to sensitive health information</div>
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
