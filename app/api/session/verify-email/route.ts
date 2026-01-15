import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token } = await req.json().catch(() => ({}));
  if (!token) return NextResponse.json({ ok: false, message: "token required" }, { status: 400 });

  // proxy to your Express backend verify endpoint
  const r = await fetch(`${process.env.BACKEND_URL}/api/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  const data = await r.json().catch(() => ({}));

  // if verify succeeded AND backend returned a session token, set cookie
  const res = NextResponse.json(data, { status: r.status });

  if (r.ok && data?.ok && data?.token) {
    res.cookies.set("evermore_token", String(data.token), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return res;
}
