// app/api/portal/dashboard/route.ts
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
      console.error("[portal/dashboard] Backend returned non-JSON:", text.slice(0, 200));
      return NextResponse.json(
        { ok: false, message: "Something went wrong. Try again." },
        { status: 500, headers: noStoreHeaders() }
      );
    }

    if (!upstream.ok) {
      const friendly = logAndMapError("portal/dashboard", { status: upstream.status, ...dash });
      return NextResponse.json(
        { ok: false, message: friendly.message },
        { status: upstream.status, headers: noStoreHeaders() }
      );
    }

    // Ensure we only spread a real object
    const dashObj: Record<string, any> =
      dash && typeof dash === "object" && !Array.isArray(dash) ? dash : {};

    // Convenience: build a pending map for the UI
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

    // Return the backend payload as-is (the UI normalizes flexibly), plus pending map
    return NextResponse.json(
      { ok: true, ...dashObj, pendingRefByInvoiceId },
      { headers: noStoreHeaders() }
    );
  } catch (err: any) {
    const friendly = logAndMapError("portal/dashboard", err);
    return NextResponse.json(
      { ok: false, message: friendly.message },
      { status: 500, headers: noStoreHeaders() }
    );
  }
}
