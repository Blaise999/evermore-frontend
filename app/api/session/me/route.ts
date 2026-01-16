// app/api/session/me/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  joinUpstream,
  noStoreHeaders,
  SESSION_COOKIE_NAME,
} from "../../../libs/upstream";
import { logAndMapError } from "../../../libs/errorMapper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const jar = await cookies();

    // Support both cookie names (legacy + current)
    const token =
      jar.get(SESSION_COOKIE_NAME)?.value ||
      jar.get("evm_token")?.value || // legacy
      null;

    if (!token) {
      return NextResponse.json(
        { ok: false, message: "Not signed in." },
        { status: 401, headers: noStoreHeaders() }
      );
    }

    // ✅ Use canonical upstream helper with new URL() for safe URL building
    const upstreamUrl = joinUpstream("/api/auth/me");

    const upstream = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const text = await upstream.text();
    let data: any = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      console.error("[session/me] Backend returned non-JSON:", text.slice(0, 200));
      return NextResponse.json(
        { ok: false, message: "Something went wrong. Try again." },
        { status: 500, headers: noStoreHeaders() }
      );
    }

    // If backend returned error
    if (!upstream.ok || !data?.ok) {
      return NextResponse.json(
        { ok: false, message: "Session expired. Please sign in again." },
        { status: 401, headers: noStoreHeaders() }
      );
    }

    return NextResponse.json(data, { headers: noStoreHeaders() });
  } catch (err: any) {
    const friendly = logAndMapError("session/me", err);
    return NextResponse.json(
      { ok: false, message: friendly.message },
      { status: 500, headers: noStoreHeaders() }
    );
  }
}
