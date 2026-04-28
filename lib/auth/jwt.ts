import { jwtVerify, SignJWT } from "jose";

import type { SesionUsuario } from "@/types/facturacion";

// 2026-04-28: Tokens firmados HS256 sólo servidor; AUTH_SECRET debe ser ≥32 caracteres.

function requiredSecret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      "AUTH_SECRET no configurado o débil — defínalo en .env.local (≥32 caracteres).",
    );
  }
  return new TextEncoder().encode(s);
}

const SESSION_COOKIE_NAME = "facturacion_session";
// 2026-04-28: Evita TTL inválidos (NaN, 0 o negativos) para no emitir JWT con expiración incorrecta.
function parseSessionMaxAge(raw: string | undefined): number {
  if (!raw) return 12 * 60 * 60;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return 12 * 60 * 60;
  return Math.floor(parsed);
}
const SESSION_TTL_SEC = parseSessionMaxAge(process.env.SESSION_MAX_AGE);

export async function signSessionToken(user: SesionUsuario): Promise<string> {
  return new SignJWT({
    app: user.app,
    apm: user.apm,
    nombre: user.nombre,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SEC}s`)
    .sign(requiredSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<SesionUsuario | null> {
  try {
    const { payload } = await jwtVerify(token, requiredSecret(), {
      algorithms: ["HS256"],
    });
    const sub = payload.sub;
    if (
      typeof sub !== "string" ||
      typeof payload.app !== "string" ||
      typeof payload.apm !== "string" ||
      typeof payload.nombre !== "string"
    )
      return null;
    return { sub, app: payload.app, apm: payload.apm, nombre: payload.nombre };
  } catch {
    return null;
  }
}

export { SESSION_COOKIE_NAME, SESSION_TTL_SEC };
