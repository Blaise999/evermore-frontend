import { NextResponse } from "next/server";
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

export async function POST(req: Request) {
  const token = (await cookies()).get("evermore_token")?.value;
  if (!token) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401, headers: noStoreHeaders() });
  }

  let body: any = {};
  try { body = await req.json(); } catch {}

  const amount = Number(body?.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ ok: false, message: "Invalid amount" }, { status: 400, headers: noStoreHeaders() });
  }

  // ✅ Euro only (as you confirmed)
  const payload = { amount, currency: "EUR" };

  const backendBase = process.env.EVERMORE_API_URL || "http://localhost:8080";
  const backend = createEvermoreApi({ baseUrl: backendBase, apiPrefix: "/api" });

  // Your Express backend has this route:
  // POST /api/patient/careflex/repayments
  const r = await backend.request<any>("/patient/careflex/repayments", {
    method: "POST",
    token,
    body: payload,
  });

  return NextResponse.json(r, { headers: noStoreHeaders() });
}
