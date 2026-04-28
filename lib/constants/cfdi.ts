// 2026-04-28: Catálogo de régimen fiscal y CFDI migrado desde facturacion.php original.

export const MONEDAS: { codigo: string; etiqueta: string }[] = [
  { codigo: "MXN", etiqueta: "Peso mexicano (MXN)" },
  { codigo: "USD", etiqueta: "Dólar estadounidense (USD)" },
  { codigo: "EUR", etiqueta: "Euro (EUR)" },
  { codigo: "GBP", etiqueta: "Libra esterlina (GBP)" },
  { codigo: "JPY", etiqueta: "Yen japonés (JPY)" },
  { codigo: "CAD", etiqueta: "Dólar canadiense (CAD)" },
  { codigo: "CHF", etiqueta: "Franco suizo (CHF)" },
  { codigo: "AUD", etiqueta: "Dólar australiano (AUD)" },
  { codigo: "CNY", etiqueta: "Yuan chino (CNY)" },
  { codigo: "BRL", etiqueta: "Real brasileño (BRL)" },
  { codigo: "KRW", etiqueta: "Won surcoreano (KRW)" },
  { codigo: "INR", etiqueta: "Rupia india (INR)" },
  { codigo: "RUB", etiqueta: "Rublo ruso (RUB)" },
  { codigo: "ZAR", etiqueta: "Rand sudafricano (ZAR)" },
];

export const REGIMENES_FISCALES: Record<string, string> = {
  "601": "General de Ley Personas Morales",
  "603": "Personas Morales con Fines no Lucrativos",
  "605": "Sueldos y Salarios e Ingresos Asimilados a Salarios",
  "606": "Arrendamiento",
  "607": "Régimen de Enajenación o Adquisición de Bienes",
  "608": "Demás ingresos",
  "609": "Consolidación",
  "610":
    "Residentes en el extranjero sin establecimiento permanente en México",
  "611": "Ingresos por dividendos (socios y accionistas)",
  "612": "Personas Físicas con Actividades Empresariales y Profesionales",
  "614": "Ingresos por intereses",
  "615": "Régimen de los ingresos por obtención de premios",
  "616": "Sin obligaciones fiscales",
  "620":
    "Sociedades Cooperativas de Producción que optan por diferir sus ingresos",
  "621": "Incorporación Fiscal",
  "622": "Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras",
  "623": "Opcional para Grupos de Sociedades",
  "624": "Coordinados",
  "625":
    "Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas",
  "626": "Régimen Simplificado de Confianza",
};

export const USO_CFDI: Record<string, string> = {
  G01: "Adquisición de mercancías",
  G02: "Devoluciones, descuentos o bonificaciones",
  G03: "Gastos en general",
  I01: "Construcciones",
  I02: "Mobiliario y equipo de oficina por inversiones",
  I03: "Equipo de transporte",
  I04: "Equipo de cómputo y accesorios",
  I05: "Dados, troqueles, moldes, matrices y herramental",
  I06: "Comunicaciones telefónicas",
  I07: "Comunicaciones satelitales",
  I08: "Otra maquinaria y equipo",
  D01: "Honorarios médicos, dentales y gastos hospitalarios",
  D02: "Gastos médicos por incapacidad o discapacidad",
  D03: "Gastos funerales",
  D04: "Donativos",
  D05:
    "Intereses reales efectivamente pagados por créditos hipotecarios (casa habitación)",
  D06: "Aportaciones voluntarias al SAR",
  D07: "Primas por seguros de gastos médicos",
  D08: "Gastos de transportación escolar obligatoria",
  D09:
    "Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones",
  D10: "Pagos por servicios educativos (colegiaturas)",
  CP01: "Pagos",
  CN01: "Nómina",
};
