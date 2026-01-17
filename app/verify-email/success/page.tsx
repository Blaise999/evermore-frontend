// app/verify-email/success/page.tsx
import { Suspense } from "react";
import VerifyEmailSuccessClient from "./VerifyEmailSuccessClient";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-xl">
      <Suspense
        fallback={
          <div className="rounded-[32px] bg-white p-7 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.10)] sm:p-9">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
              <p className="mt-4 text-sm font-medium text-slate-600">Loading…</p>
            </div>
          </div>
        }
      >
        <VerifyEmailSuccessClient />
      </Suspense>
    </div>
  );
}
