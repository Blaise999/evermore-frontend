// app/api/auth/verify-email/route.ts
import { NextResponse } from "next/server";
import { joinUpstream, noStoreHeaders } from "../../../libs/upstream";
import { logAndMapError } from "../../../libs/errorMapper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = String(url.searchParams.get("token") || "").trim();

  if (!token) {
    return NextResponse.redirect(
      new URL(`/verify-email/error?reason=${encodeURIComponent("Missing token.")}`, url)
    );
  }

  try {
    // ✅ Use canonical upstream helper with new URL() for safe URL building
    const upstreamUrl = joinUpstream(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);

    // Call backend verify endpoint but do NOT follow its redirect (avoid loops)
    const upstream = await fetch(upstreamUrl, {
      method: "GET",
      redirect: "manual",
      cache: "no-store",
    });

    // If backend redirects => treat as success
    if (upstream.status >= 300 && upstream.status < 400) {
      return NextResponse.redirect(new URL("/verify-email/success", url));
    }

    // If backend returns JSON error, show error page
    let msg = "This verification link is invalid or has expired.";
    try {
      const j = await upstream.json();
      if (j?.message) msg = String(j.message);
    } catch {
      // ignore
    }

    return NextResponse.redirect(
      new URL(`/verify-email/error?reason=${encodeURIComponent(msg)}`, url)
    );
  } catch (err: any) {
    logAndMapError("auth/verify-email", err);
    return NextResponse.redirect(
      new URL(`/verify-email/error?reason=${encodeURIComponent("Verification failed. Try again.")}`, url)
    );
  }
}
