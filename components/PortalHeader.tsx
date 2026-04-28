import Link from "next/link";

import type { SesionUsuario } from "@/types/facturacion";

// 2026-04-28: Cabecera responsive con área táctil amplia y navegación clara.

type Props = { session: SesionUsuario };

export function PortalHeader({ session }: Props) {
  // 2026-04-28: Evita repetir etiqueta genérica "Usuario <ref>" en la cabecera.
  const nombreGenerico = `usuario ${session.sub}`.toLowerCase();
  const etiquetaUsuario = [session.app, session.apm, session.nombre]
    .map((x) => x.trim())
    .filter(Boolean)
    .filter((x) => x.toLowerCase() !== nombreGenerico)
    .join(" ")
    .trim();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-[color:oklch(0.99_0.01_250_/0.95)] backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-3">
          <div
            aria-hidden
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-950 text-lg font-semibold text-amber-200"
          >
            W
          </div>
          <div>
            <p className="font-display text-lg font-semibold leading-tight text-indigo-950">
              Alta de facturación
            </p>
            <p className="text-sm text-slate-600">
              {session.sub}
              {etiquetaUsuario ? ` · ${etiquetaUsuario}` : null}
            </p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-3 sm:justify-end" aria-label="Acciones de cuenta">
          <Link
            href="https://winston93.edu.mx"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-slate-300 px-5 text-sm font-medium text-indigo-950 transition hover:bg-slate-50"
          >
            Perfil (sitio institucional)
          </Link>
          <Link
            href="/api/auth/logout"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-rose-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-800"
          >
            Cerrar sesión
          </Link>
        </nav>
      </div>
    </header>
  );
}
