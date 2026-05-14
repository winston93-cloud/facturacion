import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getSessionFromRequest } from "@/lib/auth/session-from-request";
import { saveFacturacionFromFormData } from "@/lib/facturacion/save-from-form-data";

// 2026-05-14: Guardado vía POST con cookie; sesión leída de NextRequest.cookies (fiable en Vercel).
export const dynamic = "force-dynamic";

function isSameSiteOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("host")?.split(":")[0];
  if (!host) return false;
  try {
    return new URL(origin).hostname === host;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!isSameSiteOrigin(request)) {
    return NextResponse.json(
      { ok: false, message: "Origen no permitido." } as const,
      { status: 403 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Solicitud inválida." } as const,
      { status: 400 },
    );
  }

  const session = await getSessionFromRequest(request);
  const result = await saveFacturacionFromFormData(formData, session);
  return NextResponse.json(result);
}
