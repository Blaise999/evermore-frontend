// app/signup/SignupForm.client.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

// ✅ use your existing API client (DO NOT edit lib/Api.ts)
import { api, ApiError } from "../libs/Api";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

/** ---- Icons (lightweight, no deps) ---- */
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

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
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

function inputBase() {
  return "w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40";
}

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  password: string;
  password2: string;
  insurance: string;
  agree: boolean;
  marketing: boolean;
};

function validate(form: FormState) {
  const e: Record<string, string> = {};
  if (!form.firstName.trim()) e.firstName = "First name is required.";
  if (!form.lastName.trim()) e.lastName = "Last name is required.";

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  if (!emailOk) e.email = "Enter a valid email address.";

  if (form.phone.trim().length < 8) e.phone = "Enter a valid phone number.";
  if (!form.dob) e.dob = "Date of birth is required.";

  if (form.password.length < 8) e.password = "Password must be at least 8 characters.";
  if (form.password2 !== form.password) e.password2 = "Passwords do not match.";
  if (!form.agree) e.agree = "You must agree to continue.";

  return e;
}

export default function SignupForm() {
  const router = useRouter();

  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    password: "",
    password2: "",
    insurance: "",
    agree: false,
    marketing: false,
  });

  const [busy, setBusy] = useState(false);
  const [apiErr, setApiErr] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const errors = useMemo(() => {
    if (!submitAttempted) return {};
    return validate(form);
  }, [form, submitAttempted]);

  const strength = useMemo(() => {
    const p = form.password;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  }, [form.password]);

  const strengthLabel =
    strength <= 1 ? "Weak" : strength === 2 ? "Okay" : strength === 3 ? "Strong" : "Very strong";
  const strengthWidth = `${(strength / 4) * 100}%`;

  const onChange = (k: keyof FormState, v: any) => setForm((s) => ({ ...s, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitAttempted(true);
    setApiErr(null);

    const nowErrors = validate(form);
    if (Object.keys(nowErrors).length > 0) return;

    setBusy(true);
    try {
      const name = `${form.firstName} ${form.lastName}`.trim();
      const email = form.email.trim().toLowerCase();
      const phone = form.phone.trim();

      // ✅ create account (backend should send verification email)
      await api.auth.signup({
        name,
        email,
        password: form.password,
        phone: phone ? phone : null,
      });

      // ✅ go to "check your email" screen
      router.push(`/signup/check-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      if (err instanceof ApiError) setApiErr(err.message || "Signup failed.");
      else setApiErr("Signup failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-[32px] bg-white p-6 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.10)] sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-500">Create account</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Your patient profile</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Create your account, then verify your email. After verification, you’ll connect your UK bank before accessing
            the dashboard.
          </p>
        </div>
      </div>

      {apiErr ? (
        <div className="mt-6 rounded-3xl bg-rose-50 p-4 text-sm font-semibold text-rose-700 ring-1 ring-rose-200">
          {apiErr}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-7 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" error={(errors as any).firstName}>
            <input
              className={inputBase()}
              value={form.firstName}
              onChange={(e) => onChange("firstName", e.target.value)}
              placeholder="Blaise"
              autoComplete="given-name"
            />
          </Field>

          <Field label="Last name" error={(errors as any).lastName}>
            <input
              className={inputBase()}
              value={form.lastName}
              onChange={(e) => onChange("lastName", e.target.value)}
              placeholder="Idoko"
              autoComplete="family-name"
            />
          </Field>
        </div>

        <Field label="Email address" hint="Used for results + login" error={(errors as any).email}>
          <input
            className={inputBase()}
            value={form.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            inputMode="email"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone number" hint="For verification + reminders" error={(errors as any).phone}>
            <input
              className={inputBase()}
              value={form.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              placeholder="+44 7700 900123"
              autoComplete="tel"
              inputMode="tel"
            />
          </Field>

          <Field label="Date of birth" hint="For patient matching" error={(errors as any).dob}>
            <input
              className={inputBase()}
              value={form.dob}
              onChange={(e) => onChange("dob", e.target.value)}
              type="date"
              autoComplete="bday"
            />
          </Field>
        </div>

        <Field label="Insurance (optional)" hint="You can add later">
          <input
            className={inputBase()}
            value={form.insurance}
            onChange={(e) => onChange("insurance", e.target.value)}
            placeholder="Provider name / plan"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Password" hint="8+ characters" error={(errors as any).password}>
            <div className="relative">
              <input
                className={cn(inputBase(), "pr-12")}
                value={form.password}
                onChange={(e) => onChange("password", e.target.value)}
                placeholder="Create a password"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
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

            <div className="mt-2 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-semibold text-slate-600">Password strength</div>
                <div className="text-xs font-semibold text-slate-900">{strengthLabel}</div>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                <div
                  className={cn(
                    "h-full rounded-full transition",
                    strength <= 1 ? "bg-rose-500/70" : strength === 2 ? "bg-amber-500/70" : "bg-emerald-500/70"
                  )}
                  style={{ width: strengthWidth }}
                />
              </div>
              <div className="mt-2 text-xs text-slate-600">Tip: add an uppercase letter, a number, and a symbol.</div>
            </div>
          </Field>

          <Field label="Confirm password" error={(errors as any).password2}>
            <div className="relative">
              <input
                className={cn(inputBase(), "pr-12")}
                value={form.password2}
                onChange={(e) => onChange("password2", e.target.value)}
                placeholder="Re-enter password"
                type={showPw2 ? "text" : "password"}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw2((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-600 hover:bg-slate-50"
                aria-label={showPw2 ? "Hide password" : "Show password"}
              >
                {showPw2 ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </Field>
        </div>

        <div className="space-y-3">
          <label className="flex items-start gap-3 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <input
              type="checkbox"
              checked={form.agree}
              onChange={(e) => onChange("agree", e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300"
            />
            <div className="text-sm leading-relaxed">
              <div className="font-semibold text-slate-900">
                I agree to the{" "}
                <Link href="/terms" prefetch={false} className="text-blue-700 hover:underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" prefetch={false} className="text-blue-700 hover:underline">
                  Privacy Policy
                </Link>
                .
              </div>

              <div className="mt-1 text-xs font-medium text-slate-600">
                This helps us protect your account and patient information.
              </div>

              {(errors as any).agree && <div className="mt-2 text-xs font-semibold text-rose-600">{(errors as any).agree}</div>}
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-3xl bg-white p-4 ring-1 ring-slate-200">
            <input
              type="checkbox"
              checked={form.marketing}
              onChange={(e) => onChange("marketing", e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300"
            />
            <div className="text-sm leading-relaxed">
              <div className="font-semibold text-slate-900">Send me health reminders (optional)</div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                Appointment reminders, follow-up notes, and service updates. You can turn this off anytime.
              </div>
            </div>
          </label>
        </div>

        <div className="pt-2">
          <button
            disabled={busy}
            type="submit"
            className={cn(
              "w-full rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(37,99,235,.24)] transition hover:bg-blue-700 active:translate-y-[1px]",
              busy && "opacity-70 cursor-not-allowed"
            )}
          >
            {busy ? "Creating account…" : "Create account & verify email"}
          </button>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
            <div className="text-slate-600">
              Already have an account?{" "}
              <Link href="/login" prefetch={false} className="font-semibold text-blue-700 hover:underline">
                Login
              </Link>
            </div>
            <Link href="/help" prefetch={false} className="font-semibold text-slate-700 hover:underline">
              Need help?
            </Link>
          </div>
        </div>
      </form>

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
