// app/api/patient/appointments/book/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  joinUpstream,
  noStoreHeaders,
  SESSION_COOKIE_NAME,
} from "../../../../libs/upstream";
import { logAndMapError } from "../../../../libs/errorMapper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { ok: false, message: "Not signed in." },
      { status: 401, headers: noStoreHeaders() }
    );
  }

  try {
    const body = await req.json();

    // ✅ Use canonical upstream helper with new URL() for safe URL building
    const upstreamUrl = joinUpstream("/api/patient/appointments/book");

    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const text = await upstream.text();
    let data: any = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      console.error("[patient/appointments/book] Backend returned non-JSON:", text.slice(0, 200));
      data = { ok: false, message: "Something went wrong. Try again." };
    }

    return NextResponse.json(data, {
      status: upstream.status,
      headers: noStoreHeaders(),
    });
  } catch (err: any) {
    const friendly = logAndMapError("patient/appointments/book", err);
    return NextResponse.json(
      { ok: false, message: friendly.message },
      { status: 500, headers: noStoreHeaders() }
    );
  }
}
