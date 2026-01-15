import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = (await cookies()).get("evermore_token")?.value;
  if (!token) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const invoiceId = String(id || "");
  if (!invoiceId || invoiceId === "undefined" || invoiceId === "null") {
    return NextResponse.json({ ok: false, message: "Invalid invoice ID", invoiceId }, { status: 400 });
  }

  const backendBase = process.env.EVERMORE_API_URL || "http://localhost:8080";

  // read body once (avoid stream reuse errors)
  const bodyObj = await req.json().catch(() => ({}));

  // try the most likely backend routes (adjust if yours is different)
  const candidates = [
    `${backendBase}/api/patient/invoices/${invoiceId}/submit-payment`,
    `${backendBase}/api/patient/invoices/${invoiceId}/pay`,
    `${backendBase}/api/patient/invoices/${invoiceId}/pay-now`,
  ];

  let lastStatus = 0;
  let lastText = "";

  for (const url of candidates) {
    const r = await fetch(url, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        // support both common auth styles
        Authorization: `Bearer ${token}`,
        Cookie: `evermore_token=${token}`,
      },
      body: JSON.stringify(bodyObj),
    }).catch(() => null);

    if (r?.ok) {
      const data = await r.json().catch(() => ({}));
      return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
    }

    if (r) {
      lastStatus = r.status;
      lastText = await r.text().catch(() => "");
    }
  }

  return NextResponse.json(
    {
      ok: false,
      message: "Payment endpoint not found/mismatched on backend",
      invoiceId,
      tried: candidates.map((u) => u.replace(backendBase, "<backend>")),
      lastStatus,
      lastText: lastText.slice(0, 250),
    },
    { status: 404 }
  );
}
