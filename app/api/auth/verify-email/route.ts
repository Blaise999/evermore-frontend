// app/api/auth/verify-email/route.ts
import { NextResponse } from "next/server";
import { joinUpstream } from "../../../libs/upstream";
import { logAndMapError } from "../../../libs/errorMapper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeNext(next: string | null) {
  // Prevent open-redirects
  if (!next) return "/onboarding/bank";
  if (!next.startsWith("/")) return "/onboarding/bank";
  if (next.startsWith("//")) return "/onboarding/bank";
  return next;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = String(url.searchParams.get("token") || "").trim();
  const nextPath = safeNext(url.searchParams.get("next"));

  if (!token) {
    return NextResponse.redirect(
      new URL(`/verify-email/error?reason=${encodeURIComponent("Missing token.")}`, url.origin)
    );
  }

  try {
    // Call backend verify endpoint but do NOT follow its redirect
    const upstreamUrl = joinUpstream(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);

    const upstream = await fetch(upstreamUrl, {
      method: "GET",
      redirect: "manual",
      cache: "no-store",
    });

    // ✅ Backend will redirect to /verify-email/success?token=ACCESS_TOKEN
    if (upstream.status >= 300 && upstream.status < 400) {
      const loc = upstream.headers.get("location");

      // If backend provided a Location, forward it (but keep our origin)
      if (loc) {
        const locUrl = new URL(loc, url.origin);
        const redirectUrl = new URL(`${locUrl.pathname}${locUrl.search}${locUrl.hash}`, url.origin);

        // preserve/override next (so success page knows where to go)
        redirectUrl.searchParams.set("next", nextPath);

        return NextResponse.redirect(redirectUrl);
      }

      // Fallback
      const fallback = new URL("/verify-email/success", url.origin);
      fallback.searchParams.set("next", nextPath);
      return NextResponse.redirect(fallback);
    }

    // Not a redirect => treat as error
    let msg = "This verification link is invalid or has expired.";
    try {
      const j = await upstream.json();
      if (j?.message) msg = String(j.message);
    } catch {}

    return NextResponse.redirect(
      new URL(`/verify-email/error?reason=${encodeURIComponent(msg)}`, url.origin)
    );
  } catch (err: any) {
    logAndMapError("auth/verify-email", err);
    return NextResponse.redirect(
      new URL(
        `/verify-email/error?reason=${encodeURIComponent("Verification failed. Try again.")}`,
        url.origin
      )
    );
  }
}
