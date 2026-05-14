"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { FacturacionSaveState } from "@/lib/facturacion/save-from-form-data";
import {
  MONEDAS,
  REGIMENES_FISCALES,
  USO_CFDI,
} from "@/lib/constants/cfdi";

// 2026-04-28: Formulario accesible, mobile-first.
// 2026-05-14: Guardado vía POST /api/facturacion + credentials (la cookie no llegaba al Server Action en Vercel).
// Toasts de éxito/error, router.refresh() y scroll al error.

const inputClass =
  "min-h-[48px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm transition focus:border-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-600/20";
const labelClass = "mb-2 block text-sm font-medium text-slate-700";
const errorText = (msg?: string) =>
  msg ? (
    <p className="mt-1 text-sm text-rose-700" role="alert">
      {msg}
    </p>
  ) : null;

type Props = { defaults: Record<string, string> };

export function FacturacionForm({ defaults }: Props) {
  const router = useRouter();
  const [state, setState] = useState<FacturacionSaveState | undefined>(undefined);
  const [pending, setPending] = useState(false);

  const fe = state && !state.ok ? state.fieldErrors : undefined;
  const errorRef = useRef<HTMLParagraphElement>(null);

  type ToastState = { visible: boolean; msg: string; tipo: "exito" | "error" };
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    msg: "",
    tipo: "exito",
  });

  // 2026-05-14: Envío a API con credentials para que la cookie de sesión viaje siempre.
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await fetch("/api/facturacion", {
        method: "POST",
        body: fd,
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      const body = (await res.json()) as FacturacionSaveState;
      setState(body);
    } catch {
      setState({
        ok: false,
        message: "Error de red. Intente de nuevo.",
      });
    } finally {
      setPending(false);
    }
  }

  // 2026-05-14: Dependencia [state] (referencia al objeto) para que el efecto se ejecute
  // en CADA envío, incluso si ok y message tienen los mismos valores que el envío anterior.
  // Bug anterior: [state?.ok, state?.message] no re-disparaba el efecto en guardados repetidos.
  useEffect(() => {
    if (!state) return;

    if (state.ok) {
      // Guardado exitoso: muestra toast verde y refresca datos del servidor.
      setToast({ visible: true, msg: state.message, tipo: "exito" });
      router.refresh();
      const t = setTimeout(
        () => setToast({ visible: false, msg: "", tipo: "exito" }),
        4000,
      );
      return () => clearTimeout(t);
    }

    if (state.message) {
      // Error (BD, sesión o validación global): muestra toast rojo visible.
      setToast({ visible: true, msg: state.message, tipo: "error" });
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      const t = setTimeout(
        () => setToast({ visible: false, msg: "", tipo: "error" }),
        6000,
      );
      return () => clearTimeout(t);
    }
  }, [state, router]);

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
    <>
      {/* 2026-05-14: Toast fijo en la parte inferior; verde para éxito, rojo para error.
          Se muestra en CADA envío gracias a la dependencia [state] en el useEffect. */}
      {toast.visible && (
        <div
          role={toast.tipo === "error" ? "alert" : "status"}
          aria-live={toast.tipo === "error" ? "assertive" : "polite"}
          className={
            "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex max-w-sm items-center gap-3 rounded-2xl px-6 py-4 text-white shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 " +
            (toast.tipo === "exito"
              ? "border border-emerald-300 bg-emerald-600 shadow-emerald-900/30"
              : "border border-rose-300 bg-rose-600 shadow-rose-900/30")
          }
        >
          {toast.tipo === "exito" ? (
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          <span className="text-sm font-semibold leading-snug">{toast.msg}</span>
          <button
            type="button"
            onClick={() => setToast((prev) => ({ ...prev, visible: false }))}
            className={
              "ml-2 rounded-full p-1 transition " +
              (toast.tipo === "exito" ? "hover:bg-emerald-500" : "hover:bg-rose-500")
            }
            aria-label="Cerrar"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-10"
      noValidate
    >
      {!state?.ok && state?.message ? (
        <p
          ref={errorRef}
          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-900"
          role="alert"
        >
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
        <button
          type="submit"
          disabled={pending}
          className="min-h-[52px] w-full rounded-2xl bg-indigo-950 px-6 py-3 text-base font-semibold text-amber-100 shadow-lg shadow-indigo-950/30 transition hover:bg-indigo-900 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {pending ? "Guardando…" : "Guardar datos"}
        </button>
      </div>
    </form>
    </>
  );
}
