import { z } from "zod";

// 2026-04-28: Esquema alineado a campos POST del PHP legacy; sanitización servidor en la acción.

const rfcMexico = /^([A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3})$/;
// 2026-04-28: Sanitizadores centralizados para consistencia entre UI y servidor.
const normalizeRfc = (v: string) => v.replace(/\s+/g, "").toUpperCase();
const normalizeRazonSocial = (v: string) =>
  v
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();

export const facturacionFormSchema = z.object({
  moneda: z
    .string()
    .min(3)
    .max(10)
    .transform((v) => v.trim().toUpperCase()),
  rfc: z
    .string()
    .transform(normalizeRfc)
    .pipe(z.string().min(12).max(13))
    .refine((v) => rfcMexico.test(v), {
      message: "RFC inválido (formato México).",
    }),
  razsocial: z
    .string()
    .transform(normalizeRazonSocial)
    .pipe(z.string().min(2).max(500)),
  regfiscal: z.string().min(3).max(10).trim(),
  usocfdi: z.string().min(2).max(10).trim(),
  codpostal: z
    .string()
    .regex(/^[0-9]{5}$/, "Código postal de 5 dígitos."),
  calle: z.string().min(1).max(200).trim(),
  nexterior: z.string().min(1).max(50).trim(),
  ninterior: z.string().max(50).trim().optional().default(""),
  ncolonia: z.string().min(1).max(200).trim(),
  nentidad: z.string().min(1).max(200).trim(),
  nmunicipio: z.string().min(1).max(200).trim(),
  email: z.string().email("Correo electrónico no válido."),
  lada: z.string().max(10).trim().optional().default(""),
  numero: z
    .string()
    .min(8)
    .max(20)
    .trim()
    .regex(/^[0-9+\s-]+$/, {
      message: "Teléfono con dígitos y separadores válidos.",
    }),
});

export type FacturacionFormValues = z.infer<typeof facturacionFormSchema>;
