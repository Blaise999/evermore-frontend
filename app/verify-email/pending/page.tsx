// app/verify-email/pending/page.tsx
import { Suspense } from "react";
import VerifyEmailPendingClient from "./VerifyEmailPending.client";

export default function VerifyEmailPendingPage() {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-xl p-6">Loading…</div>}>
      <VerifyEmailPendingClient />
    </Suspense>
  );
}
