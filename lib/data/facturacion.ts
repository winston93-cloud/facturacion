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
  // 2026-05-14: ORDER BY id DESC — si hubo INSERTs duplicados (PK=id, sin UNIQUE en alumno_ref),
  // el último registro es el más reciente; LIMIT 1 sin orden era indeterminado.
  const [rows] = await pool.query(
    "SELECT * FROM datos_facturacion WHERE alumno_ref = ? ORDER BY id DESC LIMIT 1",
    [alumnoRef],
  );
  const list = rows as DatosFacturacionRow[];
  const row = list[0];
  if (!row) {
    return { alumno_ref: alumnoRef, ...DEFAULTS_EMPTY };
  }
  return row;
}

// 2026-05-14: SELECT id + UPDATE/INSERT — PK es `id`; sin UNIQUE en alumno_ref el
// ON DUPLICATE KEY UPDATE no aplicaba. UPDATE solo por `affectedRows` falla si los datos no cambian (INSERT duplicado).
export async function upsertDatosFacturacion(
  alumnoRef: number,
  data: FacturacionFormValues,
): Promise<{ insertadas: number; actualizadas: number }> {
  const valores = [
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
  ];

  try {
    const [existing] = await pool.query(
      "SELECT id FROM datos_facturacion WHERE alumno_ref = ? ORDER BY id DESC LIMIT 1",
      [alumnoRef],
    );
    const rowId = (existing as Array<{ id: number }>)[0]?.id;

    if (rowId != null) {
      await pool.execute(
        `UPDATE datos_facturacion SET
          moneda = ?, rfc = ?, razsocial = ?, regfiscal = ?, usocfdi = ?,
          codpostal = ?, calle = ?, nexterior = ?, ninterior = ?, ncolonia = ?,
          nentidad = ?, nmunicipio = ?, email = ?, lada = ?, numero = ?
        WHERE id = ?`,
        [...valores, rowId],
      );
      console.info(`[facturacion] UPDATE id=${rowId} alumno_ref=${alumnoRef}`);
      return { insertadas: 0, actualizadas: 1 };
    }

    const [insertRes] = await pool.execute(
      `INSERT INTO datos_facturacion (
        moneda, rfc, razsocial, regfiscal, usocfdi,
        codpostal, calle, nexterior, ninterior, ncolonia,
        nentidad, nmunicipio, email, lada, numero, alumno_ref
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [...valores, alumnoRef],
    );
    const ins = insertRes as { affectedRows: number; insertId: number };
    console.info(
      `[facturacion] INSERT alumno_ref=${alumnoRef} affectedRows=${ins.affectedRows} insertId=${ins.insertId}`,
    );
    return { insertadas: 1, actualizadas: 0 };
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
