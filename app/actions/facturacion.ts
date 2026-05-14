"use server";

import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth/session";
import { upsertDatosFacturacion } from "@/lib/data/facturacion";
import { facturacionFormSchema } from "@/lib/validations/facturacion";

// 2026-04-28: Server Action — validación Zod y alumno_ref sólo desde sesión verificada.

export type FacturacionActionState =
  | { ok: true; message: string }
  | {
      ok: false;
      message?: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

export async function guardarFacturacion(
  _prev: FacturacionActionState | undefined,
  formData: FormData,
): Promise<FacturacionActionState> {
  const session = await getSession();
  if (!session) {
    return { ok: false, message: "Sesión requerida. Vuelva a iniciar sesión." };
  }

  const raw = Object.fromEntries(formData.entries()) as Record<string, string>;
  const parsed = facturacionFormSchema.safeParse({
    moneda: raw.moneda,
    rfc: raw.rfc,
    razsocial: raw.razsocial,
    regfiscal: raw.regfiscal,
    usocfdi: raw.usocfdi,
    codpostal: raw.codpostal,
    calle: raw.calle,
    nexterior: raw.nexterior,
    ninterior: raw.ninterior ?? "",
    ncolonia: raw.ncolonia,
    nentidad: raw.nentidad,
    nmunicipio: raw.nmunicipio,
    email: raw.email,
    lada: raw.lada ?? "",
    numero: raw.numero,
  });

  if (!parsed.success) {
    // 2026-05-14: Mensaje general visible + errores por campo para no dejar al usuario sin feedback.
    return {
      ok: false,
      message: "Por favor corrija los campos marcados en rojo antes de guardar.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const alumnoRef = Number(session.sub);
  if (!Number.isFinite(alumnoRef)) {
    return { ok: false, message: "Sesión inválida." };
  }

  // 2026-05-14: Captura errores de BD y retorna mensaje legible al usuario.
  try {
    const resultado = await upsertDatosFacturacion(alumnoRef, parsed.data);
    console.info("[action] facturacion guardada:", resultado);
  } catch (err) {
    console.error("[action] Error guardando facturacion:", err);
    return {
      ok: false,
      message: "Error al guardar en base de datos. Intente de nuevo o contacte soporte.",
    };
  }

  revalidatePath("/facturacion");
  return { ok: true, message: "Datos guardados correctamente." };
}
