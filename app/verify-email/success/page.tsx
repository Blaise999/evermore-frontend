// app/verify-email/success/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default function VerifyEmailSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [countdown, setCountdown] = useState(3);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");

    async function setupSession() {
      if (!token) {
        // No token provided - show success but link to login
        setStatus("success");
        return;
      }

      try {
        // Store the token as HttpOnly cookie via API
        const response = await fetch("/api/session/set-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(data.message || "Failed to set session");
        }

        // Also store in localStorage as backup
        try {
          localStorage.setItem("evermore_token", token);
        } catch (e) {
          // localStorage might be blocked
        }

        setStatus("success");

        // Countdown and redirect to bank connect
        const interval = setInterval(() => {
          setCountdown((c) => {
            if (c <= 1) {
              clearInterval(interval);
              router.push("/onboarding/bank");
              return 0;
            }
            return c - 1;
          });
        }, 1000);

        return () => clearInterval(interval);
      } catch (e: any) {
        console.error("Failed to setup session:", e);
        setErrorMessage(e.message || "Failed to setup session");
        setStatus("error");
      }
    }

    setupSession();
  }, [searchParams, router]);

  if (status === "processing") {
    return (
      <div className="mx-auto w-full max-w-xl">
        <div className="rounded-[32px] bg-white p-7 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.10)] sm:p-9">
          <div className="flex flex-col items-center justify-center py-8">
            <Spinner className="h-8 w-8 text-blue-600" />
            <p className="mt-4 text-sm font-medium text-slate-600">Setting up your account...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto w-full max-w-xl">
        <div className="rounded-[32px] bg-white p-7 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.10)] sm:p-9">
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Error
          </div>

          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {errorMessage || "We couldn't set up your session. Please try logging in."}
          </p>

          <div className="mt-6 grid gap-3">
            <Link
              href="/login"
              className="w-full rounded-2xl bg-blue-600 px-6 py-3.5 text-center text-sm font-semibold text-white shadow-[0_18px_44px_rgba(37,99,235,.24)] transition hover:bg-blue-700 active:translate-y-[1px]"
            >
              Sign in to your account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const hasToken = searchParams.get("token");

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="rounded-[32px] bg-white p-7 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.10)] sm:p-9">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
          <CheckIcon className="h-4 w-4" />
          Verified
        </div>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
          Email verified successfully!
        </h1>
        
        {hasToken ? (
          <>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Great! Your email has been verified. Now let's connect your bank account to complete your registration.
            </p>

            {/* Progress indicator */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
                <span className="text-emerald-600">✓ Create account</span>
                <span className="text-emerald-600">✓ Verify email</span>
                <span className="text-blue-600">→ Connect bank</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
                <div className="h-full rounded-full bg-blue-600 transition" style={{ width: "66%" }} />
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100">
              <p className="text-sm font-medium text-blue-800">
                Redirecting to bank connection in <span className="font-bold">{countdown}</span> seconds...
              </p>
            </div>

            <div className="mt-6 grid gap-3">
              <Link
                href="/onboarding/bank"
                className="w-full rounded-2xl bg-blue-600 px-6 py-3.5 text-center text-sm font-semibold text-white shadow-[0_18px_44px_rgba(37,99,235,.24)] transition hover:bg-blue-700 active:translate-y-[1px]"
              >
                Connect bank now →
              </Link>

              <button
                onClick={() => router.push("/dashboard")}
                className="w-full rounded-2xl bg-white px-6 py-3.5 text-center text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                Skip for now
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Your email has been verified successfully. You can now sign in to access your patient portal.
            </p>

            <div className="mt-6 grid gap-3">
              <Link
                href="/login"
                className="w-full rounded-2xl bg-blue-600 px-6 py-3.5 text-center text-sm font-semibold text-white shadow-[0_18px_44px_rgba(37,99,235,.24)] transition hover:bg-blue-700 active:translate-y-[1px]"
              >
                Sign in to your account
              </Link>

              <Link
                href="/help"
                className="w-full rounded-2xl bg-white px-6 py-3.5 text-center text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                Need help?
              </Link>
            </div>
          </>
        )}

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <p className="text-xs text-slate-600">
            If you have any questions about your account, please contact our support team at{" "}
            <a href="mailto:support@evermorehospitals.com" className="font-semibold text-blue-600 hover:underline">
              support@evermorehospitals.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
