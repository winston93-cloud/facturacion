import { NextResponse } from "next/server";

import { saveFacturacionFromFormData } from "@/lib/facturacion/save-from-form-data";

// 2026-05-14: Guardado vía POST con cookie enviada por el navegador (credentials).
// Mitiga el caso en que el POST del Server Action no incluye la sesión en Vercel.

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

export async function POST(request: Request) {
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

  const result = await saveFacturacionFromFormData(formData);
  return NextResponse.json(result);
}
