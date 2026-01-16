// app/api/portal/careflex/repayments/route.ts
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
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // ignore
    }

    const amount = Number(body?.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { ok: false, message: "Invalid amount." },
        { status: 400, headers: noStoreHeaders() }
      );
    }

    // Euro only (as configured)
    const payload = { amount, currency: "EUR" };

    // Use canonical upstream helper with new URL() for safe URL building
    const upstreamUrl = joinUpstream("/api/patient/careflex/repayments");

    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const text = await upstream.text();
    let data: any = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      console.error("[portal/careflex/repayments] Backend returned non-JSON:", text.slice(0, 200));
      return NextResponse.json(
        { ok: false, message: "Something went wrong. Try again." },
        { status: 500, headers: noStoreHeaders() }
      );
    }

    if (!upstream.ok) {
      const friendly = logAndMapError("portal/careflex/repayments", { status: upstream.status, ...data });
      return NextResponse.json(
        { ok: false, message: friendly.message },
        { status: upstream.status, headers: noStoreHeaders() }
      );
    }

    return NextResponse.json(data, { headers: noStoreHeaders() });
  } catch (err: any) {
    const friendly = logAndMapError("portal/careflex/repayments", err);
    return NextResponse.json(
      { ok: false, message: friendly.message },
      { status: 500, headers: noStoreHeaders() }
    );
  }
}
