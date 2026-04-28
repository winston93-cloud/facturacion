"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

// 2026-04-28: Formulario cliente con manejo de estado; credenciales sólo en tránsito HTTPS en producción.

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [alumno_ref, setAlumnoRef] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(() =>
    params.get("error") === "config"
      ? "Falta configurar AUTH_SECRET seguro en el servidor."
      : null,
  );
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alumno_ref: Number(alumno_ref),
          password,
        }),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(body.error ?? "No se pudo iniciar sesión.");
        return;
      }
      router.replace("/facturacion");
      router.refresh();
    } catch {
      setError("Error de red. Intente de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full flex-col gap-6 rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-xl shadow-slate-900/10 backdrop-blur-md"
    >
      <div>
        <label htmlFor="alumno_ref" className="mb-2 block text-sm font-medium text-slate-700">
          Referencia de alumno
        </label>
        <input
          id="alumno_ref"
          name="alumno_ref"
          type="number"
          inputMode="numeric"
          autoComplete="username"
          required
          min={1}
          value={alumno_ref}
          onChange={(e) => setAlumnoRef(e.target.value)}
          className="min-h-[48px] w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-inner focus:border-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-600/25"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
          Contraseña de portal
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="min-h-[48px] w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-inner focus:border-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-600/25"
        />
        <p className="mt-2 text-xs text-slate-500">
          La contraseña institucional debe mantenerse secreta.
        </p>
      </div>
      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="min-h-[48px] rounded-xl bg-amber-700 px-4 py-3 font-semibold text-white shadow-lg shadow-amber-900/20 transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
