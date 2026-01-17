// app/api/session/set-token/route.ts
// Called by frontend after email verification to store the token as an HttpOnly cookie
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
    const { token } = body as { token?: string };

    if (!token) {
      return NextResponse.json(
        { ok: false, message: "Token is required." },
        { status: 400, headers: noStoreHeaders() }
      );
    }

    // Validate the token by calling /api/auth/me
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
      console.error("[session/set-token] Backend returned non-JSON:", text.slice(0, 200));
      return NextResponse.json(
        { ok: false, message: "Invalid token." },
        { status: 401, headers: noStoreHeaders() }
      );
    }

    // If token is invalid
    if (!upstream.ok || !data?.ok) {
      return NextResponse.json(
        { ok: false, message: "Invalid or expired token." },
        { status: 401, headers: noStoreHeaders() }
      );
    }

    // Token is valid - set the HttpOnly cookie
    const jar = await cookies();
    jar.set(SESSION_COOKIE_NAME, token, cookieConfigWithMaxAge());

    return NextResponse.json(
      { ok: true, user: data.user },
      { headers: noStoreHeaders() }
    );
  } catch (err: any) {
    const friendly = logAndMapError("session/set-token", err);
    return NextResponse.json(
      { ok: false, message: friendly.message },
      { status: 500, headers: noStoreHeaders() }
    );
  }
}
