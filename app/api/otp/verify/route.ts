import { NextResponse } from "next/server";

const STEPUP_TTL_SECONDS = 10 * 60; // 10 mins

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const otp = typeof body?.otp === "string" ? body.otp.trim() : "";
  const purpose = typeof body?.purpose === "string" ? body.purpose : "portal_stepup";

  if (!otp) {
    return NextResponse.json({ ok: false, message: "OTP required" }, { status: 400 });
  }

  // ✅ DEV MODE: only accept "0000"
  if (otp !== "0000") {
    return NextResponse.json({ ok: false, message: "Invalid OTP" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true, message: "OTP verified.", purpose });

  // ✅ mark user as step-upped for a short window
  res.cookies.set("evermore_stepup", "1", {
    path: "/",
    maxAge: STEPUP_TTL_SECONDS,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}
