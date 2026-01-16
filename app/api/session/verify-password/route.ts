// app/api/session/verify-password/route.ts
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

async function readPassword(req: Request): Promise<string | null> {
  const ct = (req.headers.get("content-type") || "").toLowerCase();

  // Try JSON first
  if (ct.includes("application/json")) {
    const j = (await req.json().catch(() => null)) as any;
    const p =
      j?.password ??
      j?.currentPassword ??
      j?.newPassword ??
      null;
    return typeof p === "string" ? p : null;
  }

  // Try form-encoded / multipart (FormData)
  if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
    const fd = await req.formData().catch(() => null);
    const p =
      (fd?.get("password") ??
        fd?.get("currentPassword") ??
        fd?.get("newPassword")) as unknown;
    return typeof p === "string" ? p : null;
  }

  // Fallback: try text and JSON.parse
  const txt = await req.text().catch(() => "");
  if (!txt) return null;

  try {
    const j = JSON.parse(txt);
    const p = j?.password ?? j?.currentPassword ?? j?.newPassword ?? null;
    return typeof p === "string" ? p : null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const rawPassword = await readPassword(req);
    const password = rawPassword?.trim();

    if (!password) {
      return NextResponse.json(
        { ok: false, message: "Password is required." },
        { status: 400, headers: noStoreHeaders() }
      );
    }

    const jar = await cookies();
    const token = jar.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { ok: false, message: "Not signed in." },
        { status: 401, headers: noStoreHeaders() }
      );
    }

    // ✅ Use canonical upstream helper with new URL() for safe URL building
    // First, get current user's email
    const meUrl = joinUpstream("/api/auth/me");
    const meRes = await fetch(meUrl, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!meRes.ok) {
      return NextResponse.json(
        { ok: false, message: "Session expired. Please sign in again." },
        { status: 401, headers: noStoreHeaders() }
      );
    }

    const meData = await meRes.json();
    const email = meData?.user?.email?.trim();

    if (!email) {
      return NextResponse.json(
        { ok: false, message: "Session invalid." },
        { status: 401, headers: noStoreHeaders() }
      );
    }

    // Verify by re-login
    const loginUrl = joinUpstream("/api/auth/login");
    const loginRes = await fetch(loginUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    const loginData = await loginRes.json().catch(() => ({}));

    if (!loginRes.ok || !loginData?.ok) {
      return NextResponse.json(
        { ok: false, message: "Invalid password." },
        { status: 401, headers: noStoreHeaders() }
      );
    }

    // Refresh the token
    if (loginData?.token) {
      jar.set(SESSION_COOKIE_NAME, loginData.token, cookieConfigWithMaxAge());
    }

    return NextResponse.json(
      { ok: true },
      { headers: noStoreHeaders() }
    );
  } catch (err: any) {
    const friendly = logAndMapError("session/verify-password", err);
    return NextResponse.json(
      { ok: false, message: friendly.message },
      { status: 500, headers: noStoreHeaders() }
    );
  }
}
