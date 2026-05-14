import "server-only";

import type { FacturacionFormValues } from "@/lib/validations/facturacion";
import { pool } from "@/lib/db";
import type { DatosFacturacionRow } from "@/types/facturacion";

// 2026-04-28: Todas las consultas parametrizadas; sin concatenación dinámica de SQL.

const DEFAULTS_EMPTY: Omit<DatosFacturacionRow, "alumno_ref"> = {
  moneda: "MXN",
  rfc: "",
  razsocial: "",
  regfiscal: "605",
  usocfdi: "G03",
  codpostal: "",
  calle: "",
  nexterior: "",
  ninterior: "",
  ncolonia: "",
  nentidad: "",
  nmunicipio: "",
  email: "",
  lada: "",
  numero: "",
};

/** Devuelve fila o objeto con valores por defecto para alta inicial. */
export async function obtenerDatosFacturacion(
  alumnoRef: number,
): Promise<DatosFacturacionRow> {
  const [rows] = await pool.query(
    "SELECT * FROM datos_facturacion WHERE alumno_ref = ? LIMIT 1",
    [alumnoRef],
  );
  const list = rows as DatosFacturacionRow[];
  const row = list[0];
  if (!row) {
    return { alumno_ref: alumnoRef, ...DEFAULTS_EMPTY };
  }
  return row;
}

// 2026-05-14: Retorna filas afectadas para distinguir INSERT vs UPDATE y detectar problemas de clave única.
export async function upsertDatosFacturacion(
  alumnoRef: number,
  data: FacturacionFormValues,
): Promise<{ insertadas: number; actualizadas: number }> {
  try {
    const [result] = await pool.execute(
      `INSERT INTO datos_facturacion (
        alumno_ref, moneda, rfc, razsocial, regfiscal, usocfdi,
        codpostal, calle, nexterior, ninterior, ncolonia,
        nentidad, nmunicipio, email, lada, numero
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON DUPLICATE KEY UPDATE
        moneda     = VALUES(moneda),
        rfc        = VALUES(rfc),
        razsocial  = VALUES(razsocial),
        regfiscal  = VALUES(regfiscal),
        usocfdi    = VALUES(usocfdi),
        codpostal  = VALUES(codpostal),
        calle      = VALUES(calle),
        nexterior  = VALUES(nexterior),
        ninterior  = VALUES(ninterior),
        ncolonia   = VALUES(ncolonia),
        nentidad   = VALUES(nentidad),
        nmunicipio = VALUES(nmunicipio),
        email      = VALUES(email),
        lada       = VALUES(lada),
        numero     = VALUES(numero)`,
      [
        alumnoRef,
        data.moneda,
        data.rfc,
        data.razsocial,
        data.regfiscal,
        data.usocfdi,
        data.codpostal,
        data.calle,
        data.nexterior,
        data.ninterior,
        data.ncolonia,
        data.nentidad,
        data.nmunicipio,
        data.email,
        data.lada,
        data.numero,
      ],
    );
    // mysql2: affectedRows=1 → INSERT, affectedRows=2 → UPDATE, affectedRows=0 → sin cambios
    const r = result as { affectedRows: number; insertId: number };
    const insertadas = r.insertId > 0 && r.affectedRows === 1 ? 1 : 0;
    const actualizadas = r.affectedRows >= 1 && r.insertId === 0 ? 1 : 0;
    console.info(
      `[facturacion] upsert alumno_ref=${alumnoRef} affectedRows=${r.affectedRows} insertId=${r.insertId}`,
    );
    return { insertadas, actualizadas };
  } catch (err) {
    console.error("[facturacion] Error al guardar datos_facturacion:", err);
    throw err;
  }
}

/** Comprueba existencia opcional antes de iniciar sesión (mitiga fuerza bruta sobre refs). */
export async function existeRegistroFacturacion(
  alumnoRef: number,
): Promise<boolean> {
  const [rows] = await pool.query(
    "SELECT alumno_ref FROM datos_facturacion WHERE alumno_ref = ? LIMIT 1",
    [alumnoRef],
  );
  return (rows as Pick<DatosFacturacionRow, "alumno_ref">[]).length > 0;
}

/** 2026-04-28: Obtiene clave del alumno desde BD legacy para autenticar por alumno_ref. */
export async function obtenerClaveAlumnoPorRef(
  alumnoRef: number,
): Promise<string | null> {
  const [rows] = await pool.query(
    `SELECT d.alumno_clave AS clave
     FROM alumno a
     INNER JOIN alumno_detalles d ON d.alumno_id = a.alumno_id
     WHERE a.alumno_ref = ?
     LIMIT 1`,
    [alumnoRef],
  );

  const row = (rows as Array<{ clave: string | null }>)[0];
  const clave = row?.clave;
  if (typeof clave !== "string") return null;
  return clave;
}
