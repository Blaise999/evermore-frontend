import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createEvermoreApi } from "../../../libs/Api";

type RecordType = "lab" | "imaging" | "visit" | "prescription" | "document";
type RecordStatus = "Ready" | "Processing" | "Flagged" | "Synced";

type HospitalRecord = {
  id: string;
  type: RecordType;
  title: string;
  subtitle?: string;
  facility: string;
  clinician: string;
  dateISO: string;
  status: RecordStatus;
  summary: string;
  notes?: string[];
  tags?: string[];
};

function mapRecordType(t: string): RecordType {
  const x = String(t || "").toLowerCase();
  if (x === "lab") return "lab";
  if (x === "radiology" || x === "imaging") return "imaging";
  if (x === "prescription") return "prescription";
  if (x === "consultation" || x === "diagnosis" || x === "discharge") return "visit";
  return "document";
}

function mapRecordStatus(s: string): RecordStatus {
  const x = String(s || "").toLowerCase();
  if (x === "final") return "Ready";
  if (x === "draft") return "Processing";
  return "Processing";
}

export async function GET() {
  const token = (await cookies()).get("evermore_token")?.value;
  if (!token) return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });

  const backendBase = process.env.EVERMORE_API_URL || "http://localhost:8080";
  const backend = createEvermoreApi({ baseUrl: backendBase, apiPrefix: "/api" });

  const dash = await backend.patient.dashboard(token);

  const records: HospitalRecord[] = (dash.records || []).map((r: any) => ({
    id: String(r._id || r.id),
    type: mapRecordType(r.type),
    title: r.title || "Record",
    subtitle: r.summary || undefined,
    facility: "Evermore Hospitals",
    clinician: r.clinician || "Care team",
    dateISO: r.recordedAt || r.createdAt || new Date().toISOString(),
    status: mapRecordStatus(r.status),
    summary: r.summary || "—",
    notes: Array.isArray(r.data?.notes) ? r.data.notes.map(String) : undefined,
    tags: Array.isArray(r.data?.tags) ? r.data.tags.map(String) : undefined,
  }));

  // ✅ Dashboard fallback expects array via unwrap(data)
  return NextResponse.json({ data: records });
}
