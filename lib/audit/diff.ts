export type FieldChange = { field: string; before: unknown; after: unknown; changed: boolean };

function parse(s: string | null): Record<string, unknown> | string | null {
  if (s === null || s === "") return null;
  try {
    const v = JSON.parse(s);
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : s;
  } catch {
    return s; // no es JSON: se muestra tal cual
  }
}

/**
 * Compara before_str y after_str clave por clave.
 * Devuelve `raw` si alguno no es un objeto JSON.
 */
export function diffAudit(before: string | null, after: string | null) {
  const b = parse(before);
  const a = parse(after);
  if (typeof b === "string" || typeof a === "string") {
    return { raw: { before: typeof b === "string" ? b : before, after: typeof a === "string" ? a : after } } as const;
  }
  const keys = Array.from(new Set([...Object.keys(b ?? {}), ...Object.keys(a ?? {})]));
  const changes: FieldChange[] = keys.map((field) => {
    const bv = b?.[field];
    const av = a?.[field];
    return { field, before: bv, after: av, changed: JSON.stringify(bv) !== JSON.stringify(av) };
  });
  return { changes } as const;
}

export function formatValue(v: unknown): string {
  if (v === undefined) return "—";
  if (v === null) return "vacío";
  if (typeof v === "boolean") return v ? "Sí" : "No";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
