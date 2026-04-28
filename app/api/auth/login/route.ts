import { NextResponse } from "next/server";

import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_SEC,
  signSessionToken,
} from "@/lib/auth/jwt";
import { timingSafeStringEqual } from "@/lib/auth/password";
import {
  existeRegistroFacturacion,
  obtenerDatosFacturacion,
} from "@/lib/data/facturacion";

// 2026-04-28: Login con contraseña de portal en ENV — sustituir por consulta/usuario real antes de producción pública.

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const alumno_ref = Number(json?.alumno_ref);
    const password =
      typeof json?.password === "string" ? json.password : "";
    const allowNames =
      process.env.SESSION_NAMES_FROM_LOGIN === "true" &&
      process.env.NODE_ENV !== "production";
    const app = allowNames ? String(json?.alumno_app ?? "").slice(0, 120) : "";
    const apm = allowNames ? String(json?.alumno_apm ?? "").slice(0, 120) : "";
    const nombreRaw = allowNames
      ? String(json?.alumno_nombre ?? "").slice(0, 200)
      : "";

    if (!Number.isFinite(alumno_ref) || alumno_ref <= 0) {
      return NextResponse.json({ error: "Referencia inválida." }, { status: 400 });
    }

    const expectedPass = process.env.PORTAL_AUTH_PASSWORD ?? "";
    if (!expectedPass) {
      await sleep(450);
      console.error("[auth] Falta PORTAL_AUTH_PASSWORD");
      return NextResponse.json({ error: "Autenticación no configurada." }, { status: 503 });
    }

    if (!timingSafeStringEqual(expectedPass, password)) {
      await sleep(400 + Math.floor(Math.random() * 220));
      return NextResponse.json(
        { error: "Credenciales incorrectas." },
        { status: 401 },
      );
    }

    if (process.env.REQUIRE_FACTURACION_ROW === "true") {
      const existe = await existeRegistroFacturacion(alumno_ref);
      if (!existe) {
        await sleep(300);
        return NextResponse.json(
          { error: "Referencia sin registro facturación." },
          { status: 403 },
        );
      }
    }

    // 2026-04-28: Intentamos mostrar nombre real del alumno/fiscal en cabecera.
    const datosFacturacion = await obtenerDatosFacturacion(alumno_ref);
    const nombreDesdeFacturacion = String(datosFacturacion.razsocial ?? "").trim();
    const nombreSesion = allowNames
      ? nombreRaw.trim() ||
        [app, apm].filter(Boolean).join(" ").trim() ||
        nombreDesdeFacturacion
      : nombreDesdeFacturacion;

    const token = await signSessionToken({
      sub: String(alumno_ref),
      app,
      apm,
      nombre: nombreSesion,
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SEC,
    });
    return res;
  } catch {
    await sleep(200);
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
}
