// app/verify-email/success/page.tsx
import Link from "next/link";

export default function VerifyEmailSuccessPage() {
  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="rounded-[32px] bg-white p-7 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.10)] sm:p-9">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Verified
        </div>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
          Email verified
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Your email has been verified successfully. You can now sign in to access your patient portal.
        </p>

        <div className="mt-6 grid gap-3">
          <Link
            href="/login"
            prefetch={false}
            className="w-full rounded-2xl bg-blue-600 px-6 py-3.5 text-center text-sm font-semibold text-white shadow-[0_18px_44px_rgba(37,99,235,.24)] transition hover:bg-blue-700 active:translate-y-[1px]"
          >
            Sign in to your account
          </Link>

          <Link
            href="/help"
            prefetch={false}
            className="w-full rounded-2xl bg-white px-6 py-3.5 text-center text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Need help?
          </Link>
        </div>

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
