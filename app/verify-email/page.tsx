// app/verify-email/success/page.tsx
import Link from "next/link";

export default function VerifyEmailSuccessPage() {
  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="rounded-[32px] bg-white p-7 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.10)] sm:p-9">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
          Verified
        </div>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">Email verified</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Your email has been verified successfully. Next, connect your UK bank to complete setup before accessing
          your dashboard.
        </p>

        <div className="mt-6 grid gap-3">
          <Link
            href="/onboarding/bank"
            prefetch={false}
            className="w-full rounded-2xl bg-blue-600 px-6 py-3.5 text-center text-sm font-semibold text-white shadow-[0_18px_44px_rgba(37,99,235,.24)] transition hover:bg-blue-700 active:translate-y-[1px]"
          >
            Continue to connect bank
          </Link>

          {/* If you are NOT auto-logging-in on verify, this is the safe fallback */}
          <Link
            href="/login?next=%2Fonboarding%2Fbank"
            prefetch={false}
            className="w-full rounded-2xl bg-white px-6 py-3.5 text-center text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
          >
          </Link>

          <Link
            href="/help"
            prefetch={false}
            className="w-full rounded-2xl bg-white px-6 py-3.5 text-center text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Need help?
          </Link>
        </div>
      </div>
    </div>
  );
}
