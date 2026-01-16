// app/api/auth/[...path]/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getUpstreamBase,
  noStoreHeaders,
  cookieConfigWithMaxAge,
  SESSION_COOKIE_NAME,
} from "../../../libs/upstream";
import { logAndMapError } from "../../../libs/errorMapper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function proxy(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await ctx.params;
  const seg0 = path[0] || "";

  // ✅ Local logout endpoint (backend doesn't need one)
  if (seg0 === "logout") {
    const jar = await cookies();
    jar.set(SESSION_COOKIE_NAME, "", { ...cookieConfigWithMaxAge(0), maxAge: 0 });
    return NextResponse.json({ ok: true }, { headers: noStoreHeaders() });
  }

  try {
    // ✅ Use canonical upstream helper with new URL() for safe URL building
    const backendBase = getUpstreamBase();
    const incomingUrl = new URL(req.url);

    // Build target URL safely using URL constructor
    const target = new URL(`/api/auth/${path.join("/")}`, backendBase);
    target.search = incomingUrl.search;

    const method = req.method.toUpperCase();
    const hasBody = !["GET", "HEAD"].includes(method);

    const jar = await cookies();
    const token = jar.get(SESSION_COOKIE_NAME)?.value;

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
        jar.set(SESSION_COOKIE_NAME, data.token, cookieConfigWithMaxAge());
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
  } catch (err: any) {
    const friendly = logAndMapError(`auth/${path.join("/")}`, err);
    return NextResponse.json(
      { ok: false, message: friendly.message },
      { status: 500, headers: noStoreHeaders() }
    );
  }
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
