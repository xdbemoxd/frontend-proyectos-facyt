/**
 * Resolución segura del `redirectTo` posterior al login (anti open-redirect).
 *
 * Vive fuera de `lib/actions.ts` porque los archivos "use server" solo pueden
 * exportar funciones asíncronas, y así la lógica se puede probar aislada
 * (scripts/check-redirect.mjs).
 */

const FALLBACK = "/dashboard";

/** Base de confianza: la propia URL de la app, nunca la del atacante. */
function authBase(): URL | null {
  const raw = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
  if (!raw) return null;
  try {
    return new URL(raw);
  } catch {
    return null;
  }
}

/**
 * Devuelve una ruta relativa segura (mismo origen) o `/dashboard`.
 *
 * Rechaza, entre otros:
 * - `//evil.com` y `/\evil.com` (browsers los tratan como protocol-relative)
 * - `%5C` / `%5c` (barra invertida codificada)
 * - cualquier URL absoluta con otro esquema u host
 */
export function safeRedirectPath(
  redirectTo: string | null | undefined,
  baseUrl?: string
): string {
  if (typeof redirectTo !== "string" || redirectTo.length === 0) return FALLBACK;
  if (redirectTo.length > 2000) return FALLBACK;

  const raw = redirectTo.trim();
  if (!raw) return FALLBACK;

  // Barra invertida (cruda o codificada): los navegadores la normalizan a "/".
  if (raw.includes("\\") || /%5c/i.test(raw)) return FALLBACK;

  const base = (baseUrl ? safeUrl(baseUrl) : authBase()) ?? safeUrl("http://localhost");
  if (!base) return FALLBACK;

  let target: URL;
  try {
    target = new URL(raw, base);
  } catch {
    return FALLBACK;
  }

  // Debe ser el mismo esquema + host + puerto.
  if (target.origin !== base.origin) return FALLBACK;

  // Solo rutas internas: descarta userinfo, etc.
  if (!target.pathname.startsWith("/")) return FALLBACK;

  return `${target.pathname}${target.search}${target.hash}`;
}

function safeUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}
