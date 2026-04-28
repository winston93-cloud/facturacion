import { redirect } from "next/navigation";

import { FacturacionForm } from "@/components/FacturacionForm";
import { PortalHeader } from "@/components/PortalHeader";
import { obtenerDatosFacturacion } from "@/lib/data/facturacion";
import { getSession } from "@/lib/auth/session";
import type { DatosFacturacionRow } from "@/types/facturacion";

// 2026-04-28: Ruta protegida por middleware — datos cargados sólo servidor.

function filaAFallbacks(row: DatosFacturacionRow): Record<string, string> {
  const s = (v: string | null | undefined) =>
    typeof v === "string" ? v : v == null ? "" : String(v);
  return {
    moneda: s(row.moneda) || "MXN",
    rfc: s(row.rfc),
    razsocial: s(row.razsocial),
    regfiscal: s(row.regfiscal) || "605",
    usocfdi: s(row.usocfdi) || "G03",
    codpostal: s(row.codpostal),
    calle: s(row.calle),
    nexterior: s(row.nexterior),
    ninterior: s(row.ninterior),
    ncolonia: s(row.ncolonia),
    nentidad: s(row.nentidad),
    nmunicipio: s(row.nmunicipio),
    email: s(row.email),
    lada: s(row.lada),
    numero: s(row.numero),
  };
}

export default async function FacturacionPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const ref = Number(session.sub);
  if (!Number.isFinite(ref)) redirect("/login");

  const datos = await obtenerDatosFacturacion(ref);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-[color:oklch(0.97_0.018_258)] pb-14">
      <PortalHeader session={session} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8 lg:py-12">
        <div className="mb-10 text-center md:text-left">
          <div className="mx-auto mb-4 flex justify-center md:justify-start">
            <span className="inline-flex items-center rounded-2xl border border-indigo-200/70 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-indigo-900 shadow-sm backdrop-blur">
              Portal institucional
            </span>
          </div>
          <h1 className="font-display text-[clamp(1.5rem,4vw,2.125rem)] font-semibold text-indigo-950">
            Alta de facturación 2026-2027
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
            Revise cada campo antes de guardar; la información será utilizada para
            emisión fiscal conforme a normativa mexicana aplicable (CFDI).
          </p>
        </div>

        <FacturacionForm defaults={filaAFallbacks(datos)} />
      </main>
    </div>
  );
}
