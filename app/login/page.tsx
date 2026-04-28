import { Suspense } from "react";

import { LoginForm } from "@/components/LoginForm";

// 2026-04-28: Página pública de acceso — useSearchParams requiere Suspense en Next 14.

function LoginSkeleton() {
  return (
    <div className="mx-auto flex min-h-[18rem] w-full max-w-md animate-pulse flex-col gap-4 rounded-3xl bg-slate-100/80 p-8" />
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[color:oklch(0.97_0.02_255)] via-indigo-50/40 to-amber-50/60">
      <div
        className="pointer-events-none absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full bg-amber-200/30 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-36 right-[-4rem] h-[36rem] w-[36rem] rounded-full bg-indigo-200/25 blur-3xl"
        aria-hidden
      />
      <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-12 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-20">
        <div className="max-w-xl space-y-6 text-indigo-950">
          <p className="inline-flex rounded-full bg-indigo-950/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-900">
            Ciclo lectivo institucional
          </p>
          <h1 className="font-display text-[clamp(1.85rem,4vw,2.75rem)] font-semibold leading-tight">
            Portal{" "}
            <span className="text-indigo-800">de alta de facturación</span>
          </h1>
          <p className="max-w-lg text-lg text-slate-700">
            Completa tus datos tal como aparecen en tu constancia fiscal.
          </p>
          <div className="flex flex-wrap gap-4 border-t border-slate-300/70 pt-6 text-sm text-slate-600">
            <div>
              <p className="font-semibold text-indigo-900">Acceso alumno</p>
              <p>Usuario y contraseña de portal</p>
            </div>
          </div>
        </div>
        <div className="w-full shrink-0 sm:max-w-md">
          <Suspense fallback={<LoginSkeleton />}>
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
