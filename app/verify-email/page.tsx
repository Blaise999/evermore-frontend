// app/verify-email/page.tsx
import { redirect } from "next/navigation";

// This page handles the case when someone visits /verify-email without a token
// or when they need to be redirected somewhere

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { token?: string; status?: string };
}) {
  // If there's a token, the /api/auth/verify-email route should handle it
  // and redirect to /verify-email/success or /verify-email/error
  
  // If someone lands here without a token, redirect to pending
  if (!searchParams.token) {
    redirect("/verify-email/pending");
  }

  // This shouldn't normally be reached because the API route handles tokens
  // But as a fallback, show a loading state
  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="rounded-[32px] bg-white p-7 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.10)] sm:p-9">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span className="text-sm font-semibold text-slate-600">Verifying your email...</span>
        </div>
      </div>
    </div>
  );
}
