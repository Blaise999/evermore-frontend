// app/api/session/me/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createEvermoreApi } from "../../../libs/Api";

const backend = createEvermoreApi({
  baseUrl: process.env.EVERMORE_API_URL || "http://localhost:8080",
  apiPrefix: "/api",
});

export async function GET() {
  try {
    const jar = await cookies();

    // Support both cookie names (legacy + current)
    const token =
      jar.get("evermore_token")?.value ||
      jar.get("evm_token")?.value || // legacy
      null;

    if (!token) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    // Calls backend: http://localhost:8080/api/auth/me
    const me = await backend.auth.me(token);

    // If your backend returns ok:false for invalid token
    if (!me?.ok) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(me, { status: 200 });
  } catch (e: any) {
    // If backend is down or token decode fails inside the client
    return NextResponse.json(
      { ok: false, message: e?.message || "Failed to load session" },
      { status: 500 }
    );
  }
}
