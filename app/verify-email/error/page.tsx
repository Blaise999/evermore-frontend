// app/verify-email/error/page.tsx
import { Suspense } from "react";
import VerifyEmailErrorClient from "./VerifyEmailError.client";

export default function VerifyEmailErrorPage() {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-xl p-6">Loading…</div>}>
      <VerifyEmailErrorClient />
    </Suspense>
  );
}
