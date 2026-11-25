// Verificación del filtro anti open-redirect (lib/redirect.ts).
// Uso: node scripts/check-redirect.mjs
import assert from "node:assert/strict";
import { safeRedirectPath } from "../lib/redirect.ts";

const BASE = "http://localhost:3000";
const FALLBACK = "/dashboard";

const cases = [
  // ruta interna normal
  ["/dashboard", "/dashboard"],
  ["/dashboard?tab=1#x", "/dashboard?tab=1#x"],
  ["/dashboard/projects/abc/edit", "/dashboard/projects/abc/edit"],
  // protocol-relative y barras invertidas
  ["//evil.example", FALLBACK],
  ["//evil.example/path", FALLBACK],
  ["/\\evil.example", FALLBACK],
  ["\\evil.example", FALLBACK],
  ["/%5Cevil.example", FALLBACK],
  ["/%5cevil.example", FALLBACK],
  ["%5Cevil.example", FALLBACK],
  // URLs absolutas / esquemas peligrosos
  ["https://evil.example", FALLBACK],
  ["http://evil.example/dashboard", FALLBACK],
  ["javascript:alert(1)", FALLBACK],
  ["data:text/html,<h1>x</h1>", FALLBACK],
  ["JaVaScRiPt:alert(1)", FALLBACK],
  // basura
  ["", FALLBACK],
  [undefined, FALLBACK],
  ["   ", FALLBACK],
];

let failed = 0;
for (const [input, expected] of cases) {
  const actual = safeRedirectPath(input, BASE);
  try {
    assert.equal(actual, expected);
    console.log(`ok   ${JSON.stringify(input)} -> ${actual}`);
  } catch {
    failed += 1;
    console.error(`FAIL ${JSON.stringify(input)} -> ${actual} (esperado ${expected})`);
  }
}

// Sin AUTH_URL/NEXTAUTH_URL definidas tampoco debe permitir absolutas.
delete process.env.AUTH_URL;
delete process.env.NEXTAUTH_URL;
if (safeRedirectPath("https://evil.example") !== FALLBACK) {
  failed += 1;
  console.error("FAIL sin AUTH_URL: URL absoluta no fue bloqueada");
}

if (failed > 0) {
  console.error(`\n${failed} caso(s) fallaron`);
  process.exit(1);
}
console.log(`\n${cases.length + 1} casos OK`);
