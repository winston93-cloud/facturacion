# Despliegue y seguridad — portal de facturación

## Requisitos previos

1. **MySQL accesible desde Vercel**: `localhost` del phpMyAdmin/XAMMP no es alcanzable desde la nube. Opciones habituales:
   - Base de datos hospedada en un proveedor con host público (usuario/contraseña restringidos por IP o red).
   - Servidor MySQL propio abriendo `:3306` solo al rango IP de egress de Vercel (y rotando credenciales).
   - Túnel seguro o API intermedia en su propio VPS.

2. **Variables en Vercel**: copie los valores de `.env.example` al panel **Settings → Environment Variables** (Production / Preview / Development según corresponda).

3. **Secretos**: genere `AUTH_SECRET` con al menos 32 caracteres aleatorios (por ejemplo `openssl rand -hex 32`). No reutilice el secreto entre entornos si puede evitarlo.

## Integración de autenticación

La ruta `POST /api/auth/login` valida hoy **`PORTAL_AUTH_PASSWORD`** (variable de entorno) contra un `timingSafeEqual`. En producción debería sustituirse por una consulta a la misma tabla de usuarios/alumnos que usa su `login.php` (contraseña con **bcrypt/argon2** ya almacenada en MySQL).

## Credenciales

- Rotación: si alguna vez estuvieron en código o en chat público, asúmalas comprometidas y cámbielas.

## Conformidad técnica

- Consultas parametrizadas (`mysql2`).
- Sesión en cookie **HttpOnly**, **SameSite=Lax**, **Secure** en producción.
- Validación servidor con **Zod** antes de persistir datos fiscales.
- Cabeceras HTTP básicas en `next.config.mjs`.

Para endurecer más: rate limiting (p. ej. Upstash Redis en `/api/auth/login`), WAF/reglas en el proveedor, y CSP estricto según su dominio real.
