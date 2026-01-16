// app/api/portal/invoices/[id]/submit-payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  joinUpstream,
  noStoreHeaders,
  SESSION_COOKIE_NAME,
} from "../../../../../libs/upstream";
import { logAndMapError } from "../../../../../libs/errorMapper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { ok: false, message: "Not signed in." },
      { status: 401, headers: noStoreHeaders() }
    );
  }

  const { id } = await params;
  const invoiceId = String(id || "");

  if (!invoiceId || invoiceId === "undefined" || invoiceId === "null") {
    return NextResponse.json(
      { ok: false, message: "Invalid invoice ID.", invoiceId },
      { status: 400, headers: noStoreHeaders() }
    );
  }

  try {
    // Read body once (avoid stream reuse errors)
    const bodyObj = await req.json().catch(() => ({}));

    // Use canonical upstream helper with new URL() for safe URL building
    // Try the most likely backend routes (adjust if yours is different)
    const candidates = [
      `/api/patient/invoices/${invoiceId}/submit-payment`,
      `/api/patient/invoices/${invoiceId}/pay`,
      `/api/patient/invoices/${invoiceId}/pay-now`,
    ];

    let lastStatus = 0;
    let lastText = "";

    for (const path of candidates) {
      const upstreamUrl = joinUpstream(path);

      const r = await fetch(upstreamUrl, {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyObj),
      }).catch(() => null);

      if (r?.ok) {
        const data = await r.json().catch(() => ({}));
        return NextResponse.json(data, { headers: noStoreHeaders() });
      }

      if (r) {
        lastStatus = r.status;
        lastText = await r.text().catch(() => "");
      }
    }

    return NextResponse.json(
      {
        ok: false,
        message: "Payment endpoint not found on backend.",
        invoiceId,
        lastStatus,
      },
      { status: 404, headers: noStoreHeaders() }
    );
  } catch (err: any) {
    const friendly = logAndMapError("portal/invoices/submit-payment", err);
    return NextResponse.json(
      { ok: false, message: friendly.message },
      { status: 500, headers: noStoreHeaders() }
    );
  }
}
