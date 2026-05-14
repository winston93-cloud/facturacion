import "server-only";

import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth/session";
import { upsertDatosFacturacion } from "@/lib/data/facturacion";
import { facturacionFormSchema } from "@/lib/validations/facturacion";

// 2026-05-14: Lógica compartida entre Server Action y POST /api/facturacion.
// En Vercel el POST del Server Action a veces no lleva la cookie de sesión; el fetch
// explícito del cliente a la API sí envía credentials y getSession() funciona.

export type FacturacionSaveState =
  | { ok: true; message: string }
  | {
      ok: false;
      message?: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

export async function saveFacturacionFromFormData(
  formData: FormData,
): Promise<FacturacionSaveState> {
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

  let resultado: { insertadas: number; actualizadas: number };
  try {
    console.info(`[save-facturacion] alumno_ref=${alumnoRef}`);
    resultado = await upsertDatosFacturacion(alumnoRef, parsed.data);
    console.info("[save-facturacion] guardado:", resultado);
  } catch (err) {
    console.error("[save-facturacion] error BD:", err);
    return {
      ok: false,
      message:
        "Error al guardar en base de datos. Intente de nuevo o contacte soporte.",
    };
  }

  revalidatePath("/facturacion");
  const detalle =
    resultado.insertadas > 0
      ? " (nuevo registro en base de datos)"
      : " (registro actualizado)";
  return { ok: true, message: `Datos guardados correctamente${detalle}.` };
}
