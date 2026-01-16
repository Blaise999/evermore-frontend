// app/api/auth/resend-verification/route.ts
import { NextResponse } from "next/server";
import { joinUpstream, noStoreHeaders } from "../../../libs/upstream";
import { logAndMapError } from "../../../libs/errorMapper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || "").toLowerCase().trim();

    if (!email) {
      return NextResponse.json(
        { ok: false, message: "Email is required." },
        { status: 400, headers: noStoreHeaders() }
      );
    }

    // ✅ Use canonical upstream helper with new URL() for safe URL building
    const upstreamUrl = joinUpstream("/api/auth/resend-verification");

    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      cache: "no-store",
    });

    const text = await upstream.text();

    // Pass-through
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        ...noStoreHeaders(),
        "Content-Type": upstream.headers.get("content-type") || "application/json",
      },
    });
  } catch (err: any) {
    const friendly = logAndMapError("auth/resend-verification", err);
    return NextResponse.json(
      { ok: false, message: friendly.message },
      { status: 500, headers: noStoreHeaders() }
    );
  }
}
