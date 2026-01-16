// app/api/portal/appointments/book/route.ts
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
    const paymentMethod = String(body.paymentMethod || "").trim();

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

    // Use canonical upstream helper with new URL() for safe URL building
    const upstreamUrl = joinUpstream("/api/patient/appointments/book");

    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        dept,
        clinician,
        facility,
        startISO,
        notes: body.notes || null,
        estimatedCostGBP,
        paymentMethod,
      }),
      cache: "no-store",
    });

    const text = await upstream.text();
    let data: any = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      console.error("[portal/appointments/book] Backend returned non-JSON:", text.slice(0, 200));
      return NextResponse.json(
        { ok: false, message: "Something went wrong. Try again." },
        { status: 500, headers: noStoreHeaders() }
      );
    }

    if (!upstream.ok) {
      const friendly = logAndMapError("portal/appointments/book", { status: upstream.status, ...data });
      return NextResponse.json(
        { ok: false, message: friendly.message },
        { status: upstream.status, headers: noStoreHeaders() }
      );
    }

    // Expect backend to return { ok:true, requestRef, appointment, invoice? }
    return NextResponse.json(data, { headers: noStoreHeaders() });
  } catch (err: any) {
    const friendly = logAndMapError("portal/appointments/book", err);
    return NextResponse.json(
      { ok: false, message: friendly.message },
      { status: 500, headers: noStoreHeaders() }
    );
  }
}
