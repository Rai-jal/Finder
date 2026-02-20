/**
 * Proxy to GrowFast API - avoids CORS by forwarding requests server-side
 */

const API_BASE = process.env.GROWFAST_API_URL ?? "https://finder.terangacode.com/api";

async function proxy(
  req: Request,
  params: Promise<{ path: string[] }>
) {
  const { path } = await params;
  const pathStr = path.join("/");
  const url = new URL(req.url);
  const search = url.searchParams.toString();
  const targetUrl = `${API_BASE}/${pathStr}${search ? `?${search}` : ""}`;

  const headers = new Headers();
  const auth = req.headers.get("authorization");
  if (auth) headers.set("Authorization", auth);

  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  const accept = req.headers.get("accept");
  if (accept) headers.set("Accept", accept);
  else headers.set("Accept", "application/json");
  headers.set("X-Requested-With", "XMLHttpRequest");

  let body: BodyInit | undefined;
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    if (contentType?.includes("multipart/form-data") && req.body) {
      body = req.body;
    } else {
      try {
        body = await req.text();
      } catch {
        body = undefined;
      }
    }
  }

  const fetchOpts: RequestInit = {
    method: req.method,
    headers,
  };
  if (body) fetchOpts.body = body;

  const res = await fetch(targetUrl, fetchOpts);

  const responseHeaders = new Headers();
  responseHeaders.set("Access-Control-Allow-Origin", "*");
  const resContentType = res.headers.get("content-type");
  if (resContentType) responseHeaders.set("Content-Type", resContentType);

  const resBody = res.status === 204 ? undefined : await res.arrayBuffer();

  return new Response(resBody, {
    status: res.status,
    statusText: res.statusText,
    headers: responseHeaders,
  });
}

// Handle CORS preflight (OPTIONS) - browser sends this before POST/PUT/etc.
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function GET(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(req, ctx.params);
}
export async function POST(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(req, ctx.params);
}
export async function PUT(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(req, ctx.params);
}
export async function PATCH(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(req, ctx.params);
}
export async function DELETE(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(req, ctx.params);
}
