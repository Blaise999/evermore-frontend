// app/api/session/login/route.ts
import { NextResponse } from "next/server";
import { createEvermoreApi } from "../../../libs/Api";

const backend = createEvermoreApi({
  // Force backend base for Route Handlers (server-to-server)
  baseUrl: process.env.EVERMORE_API_URL || "http://localhost:8080",
  apiPrefix: "/api",
});

export async function POST(req: Request) {
  const body = await req.json(); // { email, password }
  const r = await backend.auth.login(body as { email: string; password: string });

  // NOTE: backend.auth.login returns { ok:true, user, token? }
  // For backend direct call, token should exist.
  if (!("token" in r) || !r.token) {
    return NextResponse.json({ ok: false, message: "Missing token from auth response" }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true, user: r.user });

  res.cookies.set("evermore_token", r.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
