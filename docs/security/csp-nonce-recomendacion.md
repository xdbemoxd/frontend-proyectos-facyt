# CSP con nonce por request — recomendación (no aplicada)

Fecha: 2026-11-25
Estado: **No implementado**. Se mantiene la CSP estática de `next.config.ts`.
Riesgo evaluado: alto para el alcance de este cambio; se documenta como tarea
aparte con validación en navegador.

## Situación actual

`next.config.ts` define una CSP única para todas las respuestas mediante
`headers()`. Cumple lo esencial:

- `default-src 'self'`, `object-src 'none'`, `base-uri 'self'`,
  `frame-ancestors 'none'`.
- `script-src 'self' 'unsafe-inline' https://accounts.google.com`.
- `connect-src` limitado al propio origen (y al backend solo en desarrollo).

La debilidad conocida es `'unsafe-inline'` en `script-src`: no protege frente a
XSS por inyección de `<script>` inline. La mitigación correcta sería un nonce
por request.

## Por qué no se aplicó ahora

1. **Duplicación de cabecera.** Si el proxy añade una CSP con nonce y
   `next.config.ts` sigue enviando la CSP estática, el navegador aplica la
   intersección de ambas: la política con nonce bloquearía todo script inline
   que no lo lleve. Habría que quitar la CSP de `next.config.ts`, dejando sin
   CSP las respuestas que no pasan por el matcher (`/api/*`, `_next/static`).
2. **El proxy actual es `NextAuth(authConfig).auth`.** Para inyectar el nonce
   hay que envolverlo, generar el valor con `crypto.getRandomValues`, escribir
   `x-nonce` en la request (`NextResponse.next({ request: { headers } })`) y
   copiar la CSP a la respuesta, conservando redirecciones y `Set-Cookie` de
   NextAuth. Cualquier error ahí rompe login/logout.
3. **Scripts inline de terceros.** `next-themes` inyecta un script inline; hay
   que pasarle `nonce` explícitamente. Además, `next start`/turbopack pueden
   emitir scripts inline propios (dev overlay). Sin una prueba real en
   navegador no se puede afirmar que ninguna página quede en blanco.
4. **Validación incompleta en este entorno.** Aquí solo se puede comprobar
   `typecheck` y `build`; no hay backend ni navegador para verificar el flujo
   completo de Google ni las 30+ páginas del dashboard. Aplicarlo a ciegas
   contradice la regla de no degradar el funcionamiento.

Nota sobre rendimiento: hoy **todas** las rutas ya se renderizan dinámicamente
(ƒ en el build), así que un nonce no convertiría páginas estáticas en dinámicas.
El coste real sería el riesgo operativo anterior, no la pérdida de caché
estática. Aun así, atar la CSP a middleware impide en el futuro servir la CSP
desde un CDN/edge sin ejecutar código por request.

## Cómo implementarlo de forma segura (tarea aparte)

1. Generar el nonce en el proxy (`btoa(crypto.randomUUID())` o
   `crypto.getRandomValues` + base64) y añadirlo a `script-src 'nonce-…'
   'strict-dynamic'`.
2. Eliminar la CSP de `next.config.ts` y emitirla solo en el proxy; conservar
   el resto de cabeceras de seguridad en `next.config.ts`.
3. Envolver el handler de NextAuth sin perder su `Response`
   (`redirect`, cookies) y aplicar la cabecera también a las redirecciones.
4. Leer `x-nonce` en `app/layout.tsx` (`await headers()`) y pasarlo a
   `next-themes` (`<ThemeProvider nonce={nonce}>`).
5. Validar con navegador real: login Google, dashboard completo, cambio de
   tema claro/oscuro, y consola sin errores de CSP. Añadir prueba e2e que
   verifique que un `<script>` inline sin nonce **no** se ejecuta.
6. Mantener `style-src 'unsafe-inline'` mientras Tailwind/next-themes lo
   necesiten; es una deuda menor frente a `script-src`.

## Recomendación inmediata (sin nonce)

- Revisar que ninguna página use `dangerouslySetInnerHTML` con datos del
  backend.
- No añadir scripts inline nuevos sin nonce/hash.
- Mantener `connect-src` y `img-src` cerrados (ya lo están).
