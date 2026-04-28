import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose/jwt/verify";

import { SESSION_COOKIE_NAME } from "@/lib/auth/jwt";

// 2026-04-28: Protege sólo /facturacion; JWT verificado en Edge sin acceso a MySQL.

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    return NextResponse.redirect(
      new URL("/login?error=config", request.url),
    );
  }
  try {
    await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"],
    });
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/facturacion/:path*"],
};
