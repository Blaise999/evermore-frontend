// app/api/auth/verify-email/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = String(url.searchParams.get("token") || "").trim();

  if (!token) {
    return NextResponse.redirect(new URL(`/verify-email/error?reason=${encodeURIComponent("Missing token.")}`, url));
  }

  const backend = process.env.EVERMORE_BACKEND_URL || "http://localhost:8080";

  try {
    // Call backend verify endpoint but do NOT follow its redirect (avoid loops)
    const r = await fetch(`${backend}/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
      method: "GET",
      redirect: "manual",
      cache: "no-store",
    });

    // If backend redirects => treat as success
    if (r.status >= 300 && r.status < 400) {
      return NextResponse.redirect(new URL("/verify-email/success", url));
    }

    // If backend returns JSON error, show error page
    let msg = "This verification link is invalid or has expired.";
    try {
      const j = await r.json();
      if (j?.message) msg = String(j.message);
    } catch {}

    return NextResponse.redirect(new URL(`/verify-email/error?reason=${encodeURIComponent(msg)}`, url));
  } catch {
    return NextResponse.redirect(new URL(`/verify-email/error?reason=${encodeURIComponent("Verification failed. Try again.")}`, url));
  }
}
