// app/api/auth/[...path]/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const COOKIE = "evermore_token";

function noStoreHeaders() {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  } as Record<string, string>;
}

function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
  };
}

async function proxy(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await ctx.params;
  const seg0 = path[0] || "";

  // ✅ local logout endpoint (backend doesn't need one)
  if (seg0 === "logout") {
    (await cookies()).set(COOKIE, "", { ...cookieOptions(), maxAge: 0 });
    return NextResponse.json({ ok: true }, { headers: noStoreHeaders() });
  }

  const backendBase = process.env.EVERMORE_API_URL || "http://localhost:8080";
  const url = new URL(req.url);

  const target = new URL(`${backendBase}/api/auth/${path.join("/")}`);
  target.search = url.search;

  const method = req.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);

  const token = (await cookies()).get(COOKIE)?.value;

  const upstream = await fetch(target.toString(), {
    method,
    headers: {
      ...(req.headers.get("content-type")
        ? { "Content-Type": req.headers.get("content-type") as string }
        : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: hasBody ? await req.text() : undefined,
    cache: "no-store",
  });

  const ct = upstream.headers.get("content-type") || "";
  const text = await upstream.text();

  // If JSON, we can set cookie on login/signup responses
  if (ct.includes("application/json")) {
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      return new NextResponse(text, {
        status: upstream.status,
        headers: { ...noStoreHeaders(), "Content-Type": ct || "application/json" },
      });
    }

    // ✅ When backend returns token on login/signup -> store it in HttpOnly cookie
    const isAuthTokenResponse =
      (seg0 === "login" || seg0 === "signup") && data?.ok && typeof data?.token === "string";

    if (isAuthTokenResponse) {
      (await cookies()).set(COOKIE, data.token, cookieOptions());
    }

    return NextResponse.json(data, {
      status: upstream.status,
      headers: noStoreHeaders(),
    });
  }

  // Non-json passthrough
  return new NextResponse(text, {
    status: upstream.status,
    headers: { ...noStoreHeaders(), "Content-Type": ct || "text/plain" },
  });
}

export async function GET(req: Request, ctx: any) {
  return proxy(req, ctx);
}
export async function POST(req: Request, ctx: any) {
  return proxy(req, ctx);
}
export async function PUT(req: Request, ctx: any) {
  return proxy(req, ctx);
}
export async function PATCH(req: Request, ctx: any) {
  return proxy(req, ctx);
}
export async function DELETE(req: Request, ctx: any) {
  return proxy(req, ctx);
}
