// app/api/portal/appointments/book/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { joinUpstream, noStoreHeaders, SESSION_COOKIE_NAME } from "../../../../libs/upstream";
import { logAndMapError } from "../../../../libs/errorMapper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BookBody = {
  dept?: string;
  clinician?: string;
  facility?: string;
  startISO?: string;
  notes?: string;
  estimatedCostGBP?: number;
  paymentMethod?: "linked_account" | "pay_later" | string;
};

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
    const body = (await req.json().catch(() => ({}))) as BookBody;

    const dept = String(body.dept || "").trim();
    const clinician = String(body.clinician || "").trim();
    const facility = String(body.facility || "").trim();
    const startISO = String(body.startISO || "").trim();
    const estimatedCostGBP = Number(body.estimatedCostGBP ?? 0);
    const paymentMethod = String(body.paymentMethod || "linked_account").trim();

    if (!dept) {
      return NextResponse.json(
        { ok: false, message: "Department required." },
        { status: 400, headers: noStoreHeaders() }
      );
    }
    if (!startISO || Number.isNaN(Date.parse(startISO))) {
      return NextResponse.json(
        { ok: false, message: "Valid appointment date required." },
        { status: 400, headers: noStoreHeaders() }
      );
    }
    if (!Number.isFinite(estimatedCostGBP) || estimatedCostGBP <= 0) {
      return NextResponse.json(
        { ok: false, message: "Valid cost required." },
        { status: 400, headers: noStoreHeaders() }
      );
    }

    const upstreamUrl = joinUpstream("/api/patient/appointments/book");

    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        dept,
        clinician: clinician || null,
        facility: facility || null,
        startISO,
        notes: body.notes ? String(body.notes).trim() : null,
        estimatedCostGBP,
        paymentMethod,
      }),
      cache: "no-store",
    });

    const contentType = upstream.headers.get("content-type") || "";
    const text = await upstream.text();

    // ✅ If backend gave JSON, parse it; otherwise keep text
    let data: any = null;
    if (contentType.includes("application/json")) {
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }
    }

    if (!upstream.ok) {
      // If backend returned non-JSON, expose a short snippet (dev-friendly)
      const msgFromBackend =
        data?.message ||
        (text ? text.slice(0, 200) : `Upstream error (${upstream.status})`);

      const friendly = logAndMapError("portal/appointments/book", {
        status: upstream.status,
        message: msgFromBackend,
      });

      return NextResponse.json(
        { ok: false, message: friendly.message, debug: process.env.NODE_ENV !== "production" ? msgFromBackend : undefined },
        { status: upstream.status, headers: noStoreHeaders() }
      );
    }

    // Success
    if (data) return NextResponse.json(data, { headers: noStoreHeaders() });

    // Success but non-JSON (rare) — still return something
    return NextResponse.json(
      { ok: true, message: "Booked.", raw: process.env.NODE_ENV !== "production" ? text : undefined },
      { headers: noStoreHeaders() }
    );
  } catch (err: any) {
    const friendly = logAndMapError("portal/appointments/book", err);
    return NextResponse.json(
      { ok: false, message: friendly.message },
      { status: 500, headers: noStoreHeaders() }
    );
  }
}
