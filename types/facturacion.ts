/** Fila esperada según tabla `datos_facturacion` del sistema PHP legacy. */
export interface DatosFacturacionRow {
  alumno_ref: number;
  moneda: string | null;
  rfc: string | null;
  razsocial: string | null;
  regfiscal: string | null;
  usocfdi: string | null;
  codpostal: string | null;
  calle: string | null;
  nexterior: string | null;
  ninterior: string | null;
  ncolonia: string | null;
  nentidad: string | null;
  nmunicipio: string | null;
  email: string | null;
  lada: string | null;
  numero: string | null;
}

export type SesionUsuario = {
  /** alumno_ref como cadena estable para JWT subject */
  sub: string;
  app: string;
  apm: string;
  nombre: string;
};
