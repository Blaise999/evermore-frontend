import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND =
  process.env.EVERMORE_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ HttpOnly cookie token (no localStorage)
    const cookieStore = await cookies();
    const token = cookieStore.get("evermore_token")?.value;

    if (!token) {
      return NextResponse.json(
        { ok: false, message: "Not authenticated (missing token)." },
        { status: 401 }
      );
    }

    const upstream = await fetch(`${BACKEND}/api/patient/appointments/book`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const text = await upstream.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { ok: false, message: text || "Upstream returned non-JSON." };
    }

    return NextResponse.json(data, { status: upstream.status });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
