import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createEvermoreApi } from "../../../libs/Api";

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
  const token = (await cookies()).get("evermore_token")?.value;
  if (!token) return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });

  const backendBase = process.env.EVERMORE_API_URL || "http://localhost:8080";
  const backend = createEvermoreApi({ baseUrl: backendBase, apiPrefix: "/api" });

  const dash = await backend.patient.dashboard(token);

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

  return NextResponse.json({ data: appointments });
}
