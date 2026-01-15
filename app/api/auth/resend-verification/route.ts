// app/api/auth/resend-verification/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || "").toLowerCase().trim();
    if (!email) return NextResponse.json({ ok: false, message: "email is required" }, { status: 400 });

    const backend = process.env.EVERMORE_BACKEND_URL || "http://localhost:8080";
    const r = await fetch(`${backend}/api/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      cache: "no-store",
    });

    const text = await r.text();
    // pass-through
    return new NextResponse(text, {
      status: r.status,
      headers: { "Content-Type": r.headers.get("content-type") || "application/json" },
    });
  } catch {
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}
