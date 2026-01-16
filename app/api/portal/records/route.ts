// app/api/portal/records/route.ts
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
      console.error("[portal/records] Backend returned non-JSON:", text.slice(0, 200));
      return NextResponse.json(
        { ok: false, message: "Something went wrong. Try again." },
        { status: 500, headers: noStoreHeaders() }
      );
    }

    if (!upstream.ok) {
      const friendly = logAndMapError("portal/records", { status: upstream.status, ...dash });
      return NextResponse.json(
        { ok: false, message: friendly.message },
        { status: upstream.status, headers: noStoreHeaders() }
      );
    }

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

    // Dashboard fallback expects array via unwrap(data)
    return NextResponse.json({ data: records }, { headers: noStoreHeaders() });
  } catch (err: any) {
    const friendly = logAndMapError("portal/records", err);
    return NextResponse.json(
      { ok: false, message: friendly.message },
      { status: 500, headers: noStoreHeaders() }
    );
  }
}
