// app/api/session/signup/route.ts
import { NextResponse } from "next/server";
import {
  joinUpstream,
  noStoreHeaders,
} from "../../../libs/upstream";
import { logAndMapError } from "../../../libs/errorMapper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, phone } = body as {
      name?: string;
      email?: string;
      password?: string;
      phone?: string | null;
    };

    if (!name || !email || !password) {
      return NextResponse.json(
        { ok: false, message: "Name, email, and password are required." },
        { status: 400, headers: noStoreHeaders() }
      );
    }

    // ✅ Use canonical upstream helper with new URL() for safe URL building
    const upstreamUrl = joinUpstream("/api/auth/signup");

    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone?.trim() || null,
      }),
      cache: "no-store",
    });

    const text = await upstream.text();
    let data: any = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      console.error("[session/signup] Backend returned non-JSON:", text.slice(0, 200));
      return NextResponse.json(
        { ok: false, message: "Something went wrong. Try again." },
        { status: 500, headers: noStoreHeaders() }
      );
    }

    // If backend returned error, pass through with user-friendly message
    if (!upstream.ok || !data?.ok) {
      const friendly = logAndMapError("session/signup", { status: upstream.status, ...data });
      return NextResponse.json(
        { ok: false, message: friendly.message },
        { status: upstream.status || 400, headers: noStoreHeaders() }
      );
    }

    // New flow: Backend returns { ok: true, message } - no token until email is verified
    // We do NOT set a cookie here - user needs to verify email first
    return NextResponse.json(
      { ok: true, message: data.message || "Verification email sent. Please check your inbox." },
      { headers: noStoreHeaders() }
    );
  } catch (err: any) {
    const friendly = logAndMapError("session/signup", err);
    return NextResponse.json(
      { ok: false, message: friendly.message },
      { status: 500, headers: noStoreHeaders() }
    );
  }
}
