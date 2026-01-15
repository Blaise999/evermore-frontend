import { NextResponse } from "next/server";
import { cookies } from "next/headers";
// NOTE: This file lives under app/api/**/route.ts in your Next app.
// Use a relative import that works regardless of tsconfig path aliases.
import { api } from "../../../libs/Api";

export async function GET() {
  const token = (await cookies()).get("evermore_token")?.value;
  if (!token) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });

  const data = await api.patient.dashboard(token);
  return NextResponse.json(data);
}
