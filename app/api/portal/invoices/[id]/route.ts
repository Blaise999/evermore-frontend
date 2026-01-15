import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createEvermoreApi } from "../../../../libs/Api";

export const dynamic = "force-dynamic";

function noStoreHeaders() {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  } as Record<string, string>;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = (await cookies()).get("evermore_token")?.value;
  const { id } = await params;

  if (!token) {
    return NextResponse.json(
      { ok: false, data: { message: "Not authenticated" } },
      { status: 401, headers: noStoreHeaders() }
    );
  }

  const backend = createEvermoreApi({
    baseUrl: process.env.EVERMORE_API_URL || "http://localhost:8080",
    apiPrefix: "/api",
  });

  const dash = await backend.patient.dashboard(token);
  const invoices: any[] = Array.isArray(dash?.invoices) ? dash.invoices : [];

  const hit = invoices.find((inv) => {
    const invId = String(inv?._id ?? inv?.id ?? "");
    return invId === String(id);
  });

  // Always return 200 with a helpful payload so the client can show it in the modal.
  const data = hit ?? { message: "Invoice not found", invoiceId: String(id) };
  return NextResponse.json({ ok: true, data }, { headers: noStoreHeaders() });
}
