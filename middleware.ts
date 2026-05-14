import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose/jwt/verify";

import { SESSION_COOKIE_NAME } from "@/lib/auth/jwt";

// 2026-04-28: Protege sólo /facturacion; JWT verificado en Edge sin acceso a MySQL.
// 2026-05-14: Las Server Actions llevan el header "next-action"; si se redirigen con 307
// Next.js no puede reenviar la respuesta ("failed to forward action response").
// Para esas peticiones el middleware deja pasar: el propio action valida la sesión con getSession().

export async function middleware(request: NextRequest) {
  const isServerAction =
    request.headers.get("next-action") !== null ||
    request.headers.get("Next-Action") !== null;

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    if (isServerAction) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    if (isServerAction) return NextResponse.next();
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
    if (isServerAction) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/facturacion/:path*"],
};
