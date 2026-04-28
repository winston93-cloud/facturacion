import "server-only";
import mysql from "mysql2/promise";

// 2026-04-28: Pool singleton para servidor; credenciales solo vía ENV (nunca embebidas).
// 2026-04-28: Normaliza el tamaño del pool para evitar valores inválidos en despliegues serverless.
function parsePoolLimit(raw: string | undefined): number {
  const parsed = Number(raw ?? 5);
  if (!Number.isFinite(parsed) || parsed <= 0) return 5;
  return Math.floor(parsed);
}

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: parsePoolLimit(process.env.MYSQL_POOL_LIMIT),
  maxIdle: 5,
  idleTimeout: 60_000,
  enableKeepAlive: true,
  charset: "utf8mb4_unicode_ci",
});

export { pool };
