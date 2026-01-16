// app/api/patient/dashboard/route.ts
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
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { ok: false, message: "Not signed in." },
      { status: 401, headers: noStoreHeaders() }
    );
  }

  try {
    // ✅ Use canonical upstream helper with new URL() for safe URL building
    const upstreamUrl = joinUpstream("/api/patient/dashboard");

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
      console.error("[patient/dashboard] Backend returned non-JSON:", text.slice(0, 200));
      return NextResponse.json(
        { ok: false, message: "Something went wrong. Try again." },
        { status: 500, headers: noStoreHeaders() }
      );
    }

    if (!upstream.ok) {
      const friendly = logAndMapError("patient/dashboard", { status: upstream.status, ...data });
      return NextResponse.json(
        { ok: false, message: friendly.message },
        { status: upstream.status, headers: noStoreHeaders() }
      );
    }

    return NextResponse.json(data, { headers: noStoreHeaders() });
  } catch (err: any) {
    const friendly = logAndMapError("patient/dashboard", err);
    return NextResponse.json(
      { ok: false, message: friendly.message },
      { status: 500, headers: noStoreHeaders() }
    );
  }
}
