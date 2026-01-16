// app/api/portal/invoices/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  joinUpstream,
  noStoreHeaders,
  SESSION_COOKIE_NAME,
} from "../../../../libs/upstream";
import { logAndMapError } from "../../../../libs/errorMapper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  const { id } = await params;

  if (!token) {
    return NextResponse.json(
      { ok: false, data: { message: "Not signed in." } },
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
      console.error("[portal/invoices/id] Backend returned non-JSON:", text.slice(0, 200));
      return NextResponse.json(
        { ok: false, data: { message: "Something went wrong. Try again." } },
        { status: 500, headers: noStoreHeaders() }
      );
    }

    if (!upstream.ok) {
      const friendly = logAndMapError("portal/invoices/id", { status: upstream.status, ...dash });
      return NextResponse.json(
        { ok: false, data: { message: friendly.message } },
        { status: upstream.status, headers: noStoreHeaders() }
      );
    }

    const invoices: any[] = Array.isArray(dash?.invoices) ? dash.invoices : [];

    const hit = invoices.find((inv) => {
      const invId = String(inv?._id ?? inv?.id ?? "");
      return invId === String(id);
    });

    // Always return 200 with a helpful payload so the client can show it in the modal
    const data = hit ?? { message: "Invoice not found", invoiceId: String(id) };
    return NextResponse.json({ ok: true, data }, { headers: noStoreHeaders() });
  } catch (err: any) {
    const friendly = logAndMapError("portal/invoices/id", err);
    return NextResponse.json(
      { ok: false, data: { message: friendly.message } },
      { status: 500, headers: noStoreHeaders() }
    );
  }
}
