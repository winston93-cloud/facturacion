import "server-only";
import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/jwt";

import type { SesionUsuario } from "@/types/facturacion";

// 2026-04-28: Lectura de sesión sólo en Server Components / Route Handlers.

export async function getSession(): Promise<SesionUsuario | null> {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
