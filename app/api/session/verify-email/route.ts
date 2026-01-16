// app/api/session/verify-email/route.ts
// ✅ FIXED: Was using undefined process.env.BACKEND_URL causing "ENOTFOUND https"
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  joinUpstream,
  noStoreHeaders,
  cookieConfigWithMaxAge,
  SESSION_COOKIE_NAME,
} from "../../../libs/upstream";
import { logAndMapError } from "../../../libs/errorMapper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = body?.token;

    if (!token) {
      return NextResponse.json(
        { ok: false, message: "Verification token is required." },
        { status: 400, headers: noStoreHeaders() }
      );
    }

    // ✅ Use canonical upstream helper with new URL() for safe URL building
    // This was the bug: was using `${process.env.BACKEND_URL}/api/auth/verify-email`
    // When BACKEND_URL was undefined, it became "undefined/api/auth/verify-email"
    const upstreamUrl = joinUpstream("/api/auth/verify-email");

    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      cache: "no-store",
    });

    const text = await upstream.text();
    let data: any = null;

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      console.error("[session/verify-email] Backend returned non-JSON:", text.slice(0, 200));
      data = {};
    }

    const res = NextResponse.json(data, {
      status: upstream.status,
      headers: noStoreHeaders(),
    });

    // If verify succeeded AND backend returned a session token, set cookie
    if (upstream.ok && data?.ok && data?.token) {
      const jar = await cookies();
      jar.set(SESSION_COOKIE_NAME, String(data.token), cookieConfigWithMaxAge());
    }

    return res;
  } catch (err: any) {
    const friendly = logAndMapError("session/verify-email", err);
    return NextResponse.json(
      { ok: false, message: friendly.message },
      { status: 500, headers: noStoreHeaders() }
    );
  }
}
