"use server";

import {
  saveFacturacionFromFormData,
  type FacturacionSaveState,
} from "@/lib/facturacion/save-from-form-data";

// 2026-04-28: Server Action — delega en saveFacturacionFromFormData (misma lógica que POST /api/facturacion).
// 2026-05-14: El formulario en cliente usa la API para enviar la cookie de sesión de forma fiable.

export type FacturacionActionState = FacturacionSaveState;

export async function guardarFacturacion(
  _prev: FacturacionActionState | undefined,
  formData: FormData,
): Promise<FacturacionActionState> {
  return saveFacturacionFromFormData(formData);
}
