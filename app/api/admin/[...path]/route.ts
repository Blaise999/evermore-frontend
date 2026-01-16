// app/api/admin/[...path]/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getUpstreamBase,
  noStoreHeaders,
  SESSION_COOKIE_NAME,
} from "../../../libs/upstream";
import { logAndMapError } from "../../../libs/errorMapper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function proxy(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { ok: false, message: "Not signed in." },
      { status: 401, headers: noStoreHeaders() }
    );
  }

  const { path = [] } = await ctx.params;

  try {
    // ✅ Use canonical upstream helper with new URL() for safe URL building
    const backendBase = getUpstreamBase();
    const incomingUrl = new URL(req.url);

    // Build target URL safely using URL constructor
    const target = new URL(`/api/admin/${path.join("/")}`, backendBase);
    target.search = incomingUrl.search;

    const method = req.method.toUpperCase();
    const hasBody = !["GET", "HEAD"].includes(method);

    const upstream = await fetch(target.toString(), {
      method,
      headers: {
        // Pass auth to backend
        Authorization: `Bearer ${token}`,
        // Forward content-type if present
        ...(req.headers.get("content-type")
          ? { "Content-Type": req.headers.get("content-type") as string }
          : {}),
      },
      body: hasBody ? await req.text() : undefined,
      cache: "no-store",
    });

    const contentType = upstream.headers.get("content-type") || "application/json";
    const text = await upstream.text();

    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        ...noStoreHeaders(),
        "Content-Type": contentType,
      },
    });
  } catch (err: any) {
    const friendly = logAndMapError(`admin/${path.join("/")}`, err);
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
