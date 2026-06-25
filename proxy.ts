import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const ADMIN_ONLY_GET_PREFIXES = ["/api/media", "/api/dashboard"];

function isMutationMethod(method: string) {
  return method === "POST" || method === "PATCH" || method === "PUT" || method === "DELETE";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const needsSessionPrecheck =
    isMutationMethod(request.method) ||
    (request.method === "GET" && ADMIN_ONLY_GET_PREFIXES.some((prefix) => pathname.startsWith(prefix)));

  if (needsSessionPrecheck) {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
