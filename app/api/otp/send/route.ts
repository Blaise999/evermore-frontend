import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const purpose = typeof body?.purpose === "string" ? body.purpose : "portal_stepup";

  // ✅ FIX: cookies() is async in your Next version
  const jar = await cookies();
  const token = jar.get("evermore_token")?.value;

  if (!token) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const res = NextResponse.json({
    ok: true,
    message: "OTP sent (dev mode).",
    purpose,
    debugOtp: "0000",
  });

  res.cookies.set("evermore_stepup", "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}
