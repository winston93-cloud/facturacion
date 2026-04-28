"use client";

import { useFormState, useFormStatus } from "react-dom";

import {
  guardarFacturacion,
  type FacturacionActionState,
} from "@/app/actions/facturacion";
import {
  MONEDAS,
  REGIMENES_FISCALES,
  USO_CFDI,
} from "@/lib/constants/cfdi";

// 2026-04-28: Formulario accesible, mobile-first; envío vía Server Action (mitigación CSRF integrada en Next).

const inputClass =
  "min-h-[48px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm transition focus:border-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-600/20";
const labelClass = "mb-2 block text-sm font-medium text-slate-700";
const errorText = (msg?: string) =>
  msg ? (
    <p className="mt-1 text-sm text-rose-700" role="alert">
      {msg}
    </p>
  ) : null;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-[52px] w-full rounded-2xl bg-indigo-950 px-6 py-3 text-base font-semibold text-amber-100 shadow-lg shadow-indigo-950/30 transition hover:bg-indigo-900 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {pending ? "Guardando…" : "Guardar datos"}
    </button>
  );
}

type Props = { defaults: Record<string, string> };

export function FacturacionForm({ defaults }: Props) {
  const [state, formAction] = useFormState(
    guardarFacturacion,
    undefined as FacturacionActionState | undefined,
  );

  const fe = state && !state.ok ? state.fieldErrors : undefined;
  // 2026-04-28: Normaliza RFC sin espacios y en mayúsculas durante la captura.
  const onRfcInput = (e: React.FormEvent<HTMLInputElement>) => {
    e.currentTarget.value = e.currentTarget.value
      .replace(/\s+/g, "")
      .toUpperCase();
  };
  // 2026-04-28: Razón social en mayúsculas y con espacios internos simples.
  const onRazsocialInput = (e: React.FormEvent<HTMLInputElement>) => {
    e.currentTarget.value = e.currentTarget.value
      .toUpperCase()
      .replace(/\s+/g, " ");
  };

  return (
    <form
      action={formAction}
      className="flex flex-col gap-10"
      noValidate
    >
      {state?.ok ? (
        <p
          className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900"
          role="status"
        >
          {state.message}
        </p>
      ) : null}
      {!state?.ok && state?.message ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-900" role="alert">
          {state.message}
        </p>
      ) : null}

      <p className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
        * Los datos deben coincidir exactamente con su constancia de situación fiscal.
      </p>

      {/* 2026-04-28: Desktop con jerarquía visual clara y altura pareja por fila entre columnas. */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5 xl:items-stretch">
        <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur md:p-8 xl:col-span-2 xl:row-start-1 xl:col-start-4 xl:h-full">
          <h2 className="font-display text-xl font-semibold text-indigo-950">
            Moneda
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="moneda">
                Tipo de moneda
              </label>
              <select
                id="moneda"
                name="moneda"
                defaultValue={defaults.moneda}
                className={inputClass}
              >
                {MONEDAS.map((m) => (
                  <option key={m.codigo} value={m.codigo}>
                    {m.etiqueta}
                  </option>
                ))}
              </select>
              {errorText(fe?.moneda?.[0])}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur md:p-8 xl:col-span-3 xl:row-start-1 xl:col-start-1">
          <h2 className="font-display text-xl font-semibold text-indigo-950">
            Identificación del contribuyente
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="rfc">
                RFC
              </label>
              <input
                id="rfc"
                name="rfc"
                defaultValue={defaults.rfc}
                placeholder="XAXX010101000"
                className={inputClass}
                autoComplete="off"
                onInput={onRfcInput}
                style={{ textTransform: "uppercase" }}
              />
              {errorText(fe?.rfc?.[0])}
            </div>
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="razsocial">
                Denominación / razón social
              </label>
              <input
                id="razsocial"
                name="razsocial"
                defaultValue={defaults.razsocial}
                className={inputClass}
                onInput={onRazsocialInput}
                style={{ textTransform: "uppercase" }}
              />
              {errorText(fe?.razsocial?.[0])}
            </div>
            <div>
              <label className={labelClass} htmlFor="regfiscal">
                Régimen fiscal
              </label>
              <select
                id="regfiscal"
                name="regfiscal"
                defaultValue={defaults.regfiscal}
                className={inputClass}
              >
                {Object.entries(REGIMENES_FISCALES).map(([code, desc]) => (
                  <option key={code} value={code}>
                    {code} — {desc}
                  </option>
                ))}
              </select>
              {errorText(fe?.regfiscal?.[0])}
            </div>
            <div>
              <label className={labelClass} htmlFor="usocfdi">
                Uso de CFDI
              </label>
              <select
                id="usocfdi"
                name="usocfdi"
                defaultValue={defaults.usocfdi}
                className={inputClass}
              >
                {Object.entries(USO_CFDI).map(([code, desc]) => (
                  <option key={code} value={code}>
                    {code} — {desc}
                  </option>
                ))}
              </select>
              {errorText(fe?.usocfdi?.[0])}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur md:p-8 xl:col-span-3 xl:row-start-2 xl:col-start-1">
          <h2 className="font-display text-xl font-semibold text-indigo-950">
            Domicilio fiscal
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="codpostal">
                Código postal
              </label>
              <input
                id="codpostal"
                name="codpostal"
                defaultValue={defaults.codpostal}
                inputMode="numeric"
                className={inputClass}
              />
              {errorText(fe?.codpostal?.[0])}
            </div>
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="calle">
                Calle
              </label>
              <input
                id="calle"
                name="calle"
                defaultValue={defaults.calle}
                className={inputClass}
              />
              {errorText(fe?.calle?.[0])}
            </div>
            <div>
              <label className={labelClass} htmlFor="nexterior">
                Número exterior
              </label>
              <input
                id="nexterior"
                name="nexterior"
                defaultValue={defaults.nexterior}
                className={inputClass}
              />
              {errorText(fe?.nexterior?.[0])}
            </div>
            <div>
              <label className={labelClass} htmlFor="ninterior">
                Número interior
              </label>
              <input
                id="ninterior"
                name="ninterior"
                defaultValue={defaults.ninterior}
                className={inputClass}
              />
              {errorText(fe?.ninterior?.[0])}
            </div>
            <div>
              <label className={labelClass} htmlFor="ncolonia">
                Colonia
              </label>
              <input
                id="ncolonia"
                name="ncolonia"
                defaultValue={defaults.ncolonia}
                className={inputClass}
              />
              {errorText(fe?.ncolonia?.[0])}
            </div>
            <div>
              <label className={labelClass} htmlFor="nentidad">
                Entidad federativa
              </label>
              <input
                id="nentidad"
                name="nentidad"
                defaultValue={defaults.nentidad}
                className={inputClass}
              />
              {errorText(fe?.nentidad?.[0])}
            </div>
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="nmunicipio">
                Municipio
              </label>
              <input
                id="nmunicipio"
                name="nmunicipio"
                defaultValue={defaults.nmunicipio}
                className={inputClass}
              />
              {errorText(fe?.nmunicipio?.[0])}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur md:p-8 xl:col-span-2 xl:row-start-2 xl:col-start-4 xl:h-full">
          <h2 className="font-display text-xl font-semibold text-indigo-950">
            Contacto
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <input type="hidden" name="lada" value={defaults.lada} />
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="email">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                defaultValue={defaults.email}
                autoComplete="email"
                className={inputClass}
              />
              {errorText(fe?.email?.[0])}
            </div>
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="numero">
                Teléfono celular
              </label>
              <input
                id="numero"
                name="numero"
                defaultValue={defaults.numero}
                inputMode="tel"
                className={inputClass}
              />
              {errorText(fe?.numero?.[0])}
            </div>
          </div>
        </section>
      </div>

      <div className="flex flex-col gap-4 border-t border-slate-200/80 pt-6 sm:flex-row sm:justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
