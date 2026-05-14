import "server-only";

import type { NextRequest } from "next/server";

import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/jwt";
import type { SesionUsuario } from "@/types/facturacion";

// 2026-05-14: En Route Handlers, cookies() de next/headers a veces no refleja el Cookie
// del request; leer desde NextRequest.cookies es fiable para POST /api/facturacion.

export async function getSessionFromRequest(
  request: NextRequest,
): Promise<SesionUsuario | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
