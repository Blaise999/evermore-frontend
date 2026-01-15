import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createEvermoreApi } from "../../../libs/Api";

export async function GET() {
  const token = (await cookies()).get("evermore_token")?.value;
  if (!token) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const backend = createEvermoreApi({
    baseUrl: process.env.EVERMORE_API_URL || "http://localhost:8080",
    apiPrefix: "/api",
  });

  const dash = await backend.patient.dashboard(token);

  // Your dashboard only needs label to show “Linked account”.
  const accounts = [
    {
      label: `Primary • ${dash.account?.currency || "GBP"} • ${dash.user?.hospitalId || "Evermore"}`,
    },
  ];

  // Dashboard code supports {accounts:[...]} OR [...]
  return NextResponse.json({ accounts });
}
