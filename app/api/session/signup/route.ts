// app/api/session/signup/route.ts
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

    // Backend returns { ok: true, token, user }
    if (!data.token) {
      console.error("[session/signup] Backend did not return token");
      return NextResponse.json(
        { ok: false, message: "Something went wrong. Try again." },
        { status: 500, headers: noStoreHeaders() }
      );
    }

    // Set HttpOnly cookie
    const jar = await cookies();
    jar.set(SESSION_COOKIE_NAME, data.token, cookieConfigWithMaxAge());

    return NextResponse.json(
      { ok: true, user: data.user },
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
