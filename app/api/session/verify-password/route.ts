import { createEvermoreApi, ApiError, type AuthResponse } from "../../../libs/Api";
import { cookies } from "next/headers";

function buildSetCookie(name: string, value: string) {
  const secure = process.env.NODE_ENV === "production";
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${60 * 60 * 24 * 7}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

async function readPassword(req: Request): Promise<string | null> {
  const ct = (req.headers.get("content-type") || "").toLowerCase();

  // Try JSON first
  if (ct.includes("application/json")) {
    const j = (await req.json().catch(() => null)) as any;
    const p =
      j?.password ??
      j?.currentPassword ??
      j?.newPassword ?? // (some UIs accidentally send this)
      null;
    return typeof p === "string" ? p : null;
  }

  // Try form-encoded / multipart (FormData)
  if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
    const fd = await req.formData().catch(() => null);
    const p =
      (fd?.get("password") ??
        fd?.get("currentPassword") ??
        fd?.get("newPassword")) as unknown;
    return typeof p === "string" ? p : null;
  }

  // Fallback: try text and JSON.parse
  const txt = await req.text().catch(() => "");
  if (!txt) return null;

  try {
    const j = JSON.parse(txt);
    const p = j?.password ?? j?.currentPassword ?? j?.newPassword ?? null;
    return typeof p === "string" ? p : null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const rawPassword = await readPassword(req);
    const password = rawPassword?.trim();

    if (!password) {
      return Response.json(
        {
          ok: false,
          message:
            "Password required. Send JSON like { password: \"...\" } (Content-Type: application/json).",
        },
        { status: 400 }
      );
    }

    const jar = await cookies();
    const token = jar.get("evermore_token")?.value;

    if (!token) {
      return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const backend = createEvermoreApi({
      baseUrl: process.env.EVERMORE_API_URL || "http://localhost:8080",
      apiPrefix: "/api",
    });

    // who am i?
    const me = await backend.auth.me(token);
    const email = me.user?.email?.trim();

    if (!email) {
      return Response.json({ ok: false, message: "Session invalid" }, { status: 401 });
    }

    // verify by re-login (backend guarantees token)
    const login = await backend.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
    });

    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.append("Set-Cookie", buildSetCookie("evermore_token", login.token));

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  } catch (e: any) {
    if (e instanceof ApiError) {
      const status = e.status || 500;

      // If backend says bad creds, treat as 401 for UX
      if (status === 400 || status === 401) {
        return Response.json({ ok: false, message: "Invalid password" }, { status: 401 });
      }

      return Response.json({ ok: false, message: e.message || "Verify failed" }, { status });
    }

    return Response.json({ ok: false, message: e?.message || "Verify failed" }, { status: 500 });
  }
}
