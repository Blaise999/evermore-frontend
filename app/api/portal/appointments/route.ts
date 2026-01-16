// app/api/portal/appointments/route.ts
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

type ApptStatus = "Confirmed" | "Completed" | "Cancelled";
type PatientAppointment = {
  id: string;
  dept: string;
  clinician: string;
  facility: string;
  startISO: string;
  status: ApptStatus;
  prepChecklist: string[];
};

function mapApptStatus(s: string): ApptStatus {
  const x = String(s || "").toLowerCase();
  if (x === "completed") return "Completed";
  if (x === "cancelled") return "Cancelled";
  return "Confirmed";
}

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
    // Use canonical upstream helper with new URL() for safe URL building
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
    let dash: any = null;

    try {
      dash = text ? JSON.parse(text) : null;
    } catch {
      console.error("[portal/appointments] Backend returned non-JSON:", text.slice(0, 200));
      return NextResponse.json(
        { ok: false, message: "Something went wrong. Try again." },
        { status: 500, headers: noStoreHeaders() }
      );
    }

    if (!upstream.ok) {
      const friendly = logAndMapError("portal/appointments", { status: upstream.status, ...dash });
      return NextResponse.json(
        { ok: false, message: friendly.message },
        { status: upstream.status, headers: noStoreHeaders() }
      );
    }

    const appointments: PatientAppointment[] = (dash.appointments || []).map((a: any) => ({
      id: String(a._id || a.id),
      dept: a.department || "General",
      clinician: a.doctorName || "Care team",
      facility: "Evermore Hospitals",
      startISO: a.scheduledAt || a.createdAt || new Date().toISOString(),
      status: mapApptStatus(a.status),
      prepChecklist: Array.isArray(a.data?.prepChecklist)
        ? a.data.prepChecklist.map(String)
        : ["Bring ID", "Arrive 15 minutes early"],
    }));

    return NextResponse.json({ data: appointments }, { headers: noStoreHeaders() });
  } catch (err: any) {
    const friendly = logAndMapError("portal/appointments", err);
    return NextResponse.json(
      { ok: false, message: friendly.message },
      { status: 500, headers: noStoreHeaders() }
    );
  }
}
