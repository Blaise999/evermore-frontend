import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createEvermoreApi } from "../../../libs/Api"; // ✅ if your file is actually /libs/api.ts, change to "../../../libs/api"

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
      { ok: false, message: "Unauthorized" },
      { status: 401, headers: noStoreHeaders() }
    );
  }

  const backend = createEvermoreApi({
    baseUrl: process.env.EVERMORE_API_URL || "http://localhost:8080",
    apiPrefix: "/api",
  });

  // Canonical dashboard payload from Express (Mongo-backed).
  let dash: any = null;
  try {
    dash = await backend.patient.dashboard(token);
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: e?.message || "Failed to load dashboard." },
      { status: 500, headers: noStoreHeaders() }
    );
  }

  // ✅ ensure we only spread a real object
  const dashObj: Record<string, any> =
    dash && typeof dash === "object" && !Array.isArray(dash) ? (dash as Record<string, any>) : {};

  // Convenience: build a pending map for the UI.
  const pendingRefByInvoiceId: Record<string, string> = {};

  const payments = Array.isArray(dashObj?.payments) ? dashObj.payments : [];
  for (const p of payments) {
    const st = String(p?.status ?? "").toLowerCase();
    const invoiceId = p?.invoiceId ?? p?.invoice_id ?? null;
    const ref = p?.reference ?? p?.requestRef ?? p?.ref ?? null;

    if (st === "pending" && invoiceId && ref) {
      pendingRefByInvoiceId[String(invoiceId)] = String(ref);
    }
  }

  // Return the backend payload as-is (the UI normalizes flexibly), plus pending map.
  return NextResponse.json(
    { ok: true, ...dashObj, pendingRefByInvoiceId },
    { headers: noStoreHeaders() }
  );
}
