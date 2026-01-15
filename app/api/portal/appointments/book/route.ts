import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createEvermoreApi, ApiError } from "../../../../libs/Api";

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
  try {
    const body = (await req.json().catch(() => ({}))) as BookBody;

    const dept = String(body.dept || "").trim();
    const clinician = String(body.clinician || "").trim();
    const facility = String(body.facility || "").trim();
    const startISO = String(body.startISO || "").trim();
    const estimatedCostGBP = Number(body.estimatedCostGBP ?? 0);
    const paymentMethod = String(body.paymentMethod || "").trim();

    if (!dept) return NextResponse.json({ ok: false, message: "Department required" }, { status: 400 });
    if (!startISO || Number.isNaN(Date.parse(startISO))) {
      return NextResponse.json({ ok: false, message: "Valid startISO required" }, { status: 400 });
    }
    if (!Number.isFinite(estimatedCostGBP) || estimatedCostGBP <= 0) {
      return NextResponse.json({ ok: false, message: "Valid estimatedCostGBP required" }, { status: 400 });
    }

    // ✅ Next 15/16: cookies() can be async — use await
    const jar = await cookies();
    const token = jar.get("evermore_token")?.value;
    if (!token) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });

    // Server -> Backend (no CORS issues)
    const backend = createEvermoreApi({
      baseUrl: process.env.EVERMORE_API_URL || "http://localhost:8080",
      apiPrefix: "/api",
    });

    const r = await backend.request<any>("/patient/appointments/book", {
      method: "POST",
      token,
      body: {
        dept,
        clinician,
        facility,
        startISO,
        notes: body.notes || null,
        estimatedCostGBP,
        paymentMethod,
      },
    });

    // Expect backend to return { ok:true, requestRef, appointment, invoice? }
    return NextResponse.json(r, { status: 200 });
  } catch (e: any) {
    if (e instanceof ApiError) {
      return NextResponse.json(
        { ok: false, message: e.message || "Booking failed", code: e.code, details: e.details },
        { status: e.status || 500 }
      );
    }
    return NextResponse.json({ ok: false, message: e?.message || "Booking failed" }, { status: 500 });
  }
}
