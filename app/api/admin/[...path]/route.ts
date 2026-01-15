// app/api/admin/[...path]/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

function noStoreHeaders() {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  } as Record<string, string>;
}

async function proxy(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  const token = (await cookies()).get("evermore_token")?.value;
  if (!token) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401, headers: noStoreHeaders() }
    );
  }

  const { path = [] } = await ctx.params;

  const backendBase = process.env.EVERMORE_API_URL || "http://localhost:8080";
  const url = new URL(req.url);

  // Forward to Express backend: http://localhost:8080/api/admin/...
  const target = new URL(`${backendBase}/api/admin/${path.join("/")}`);
  target.search = url.search;

  const method = req.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);

  const upstream = await fetch(target.toString(), {
    method,
    headers: {
      // pass auth to backend
      Authorization: `Bearer ${token}`,
      // forward content-type if present
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
