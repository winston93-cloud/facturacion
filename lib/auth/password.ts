import { timingSafeEqual } from "crypto";

// 2026-04-28: Comparación en tiempo constante cuando las longitudes coinciden (mitigación contra timing attacks).

export function timingSafeStringEqual(secret: string, input: string): boolean {
  const a = Buffer.from(secret, "utf8");
  const b = Buffer.from(input, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
