import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createEvermoreApi } from "../../../libs/Api";

export const dynamic = "force-dynamic";

function noStoreHeaders() {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  } as Record<string, string>;
}

export async function GET() {
  const token = (await cookies()).get("evermore_token")?.value;
  if (!token) {
    return NextResponse.json(
      { ok: false, message: "Not authenticated", data: [] },
      { status: 401, headers: noStoreHeaders() }
    );
  }

  const backend = createEvermoreApi({
    baseUrl: process.env.EVERMORE_API_URL || "http://localhost:8080",
    apiPrefix: "/api",
  });

  // Canonical source: backend Mongo invoices.
  const dash = await backend.patient.dashboard(token);
  const invoices = Array.isArray(dash?.invoices) ? dash.invoices : [];

  return NextResponse.json({ ok: true, data: invoices }, { headers: noStoreHeaders() });
}
