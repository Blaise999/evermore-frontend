// app/signup/check-email/page.tsx
import { Suspense } from "react";
import CheckEmailClient from "./check-email/CheckEmail.client";

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-lg p-8">Loading…</div>}>
      <CheckEmailClient />
    </Suspense>
  );
}
