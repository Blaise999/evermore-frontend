import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import {
  joinUpstream,
  noStoreHeaders,
  SESSION_COOKIE_NAME,
} from "../../../../../libs/upstream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return new Response(JSON.stringify({ ok: false, message: "Not signed in." }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...noStoreHeaders() },
    });
  }

  // Try backend PDF endpoint (pdfkit-based)
  try {
    const pdfUrl = joinUpstream(`/api/admin/invoices/${encodeURIComponent(id)}/pdf`);
    const res = await fetch(pdfUrl, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (res.ok) {
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("pdf")) {
        const buffer = await res.arrayBuffer();
        return new Response(buffer, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="Evermore-Invoice-${id.slice(-8)}.pdf"`,
            ...noStoreHeaders(),
          },
        });
      }
    }
  } catch {}

  return new Response(JSON.stringify({ ok: false, message: "Could not generate PDF. Please try again." }), {
    status: 500,
    headers: { "Content-Type": "application/json", ...noStoreHeaders() },
  });
}
