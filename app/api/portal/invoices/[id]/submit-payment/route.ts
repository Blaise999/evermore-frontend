import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { joinUpstream, noStoreHeaders, SESSION_COOKIE_NAME } from "../../../../../libs/upstream";
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
    return NextResponse.json({ ok: false, message: "Not signed in." }, { status: 401, headers: noStoreHeaders() });
  }

  const { id } = await params;
  const invoiceId = String(id || "");

  if (!invoiceId || invoiceId === "undefined" || invoiceId === "null") {
    return NextResponse.json({ ok: false, message: "Invalid invoice ID." }, { status: 400, headers: noStoreHeaders() });
  }

  try {
    const bodyObj = await req.json().catch(() => ({}));

    // Call the backend patient payments endpoint
    const upstreamUrl = joinUpstream("/api/patient/payments");

    const r = await fetch(upstreamUrl, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        invoiceId,
        amount: bodyObj.amount || undefined,
        method: bodyObj.method || "card",
        currency: "GBP",
      }),
    });

    const data = await r.json().catch(() => ({ ok: false, message: "Invalid response" }));

    if (!r.ok) {
      return NextResponse.json(
        { ok: false, message: data?.message || "Payment failed." },
        { status: r.status, headers: noStoreHeaders() }
      );
    }

    return NextResponse.json(data, { headers: noStoreHeaders() });
  } catch (err: any) {
    const friendly = logAndMapError("portal/invoices/submit-payment", err);
    return NextResponse.json({ ok: false, message: friendly.message }, { status: 500, headers: noStoreHeaders() });
  }
}
