/**
 * Unidades de medida que ofrecen los formularios de materia prima.
 * En la BD `unit` es texto libre (varchar(30)); esta lista solo guía la entrada.
 */
export const UNITS = ["unidad", "g", "kg", "mL", "L", "caja", "paquete"] as const;

/** Opciones del <select>; incluye la unidad actual si no está en la lista. */
export function unitOptions(current?: string | null) {
  const units: string[] = [...UNITS];
  if (current && !units.includes(current)) units.unshift(current);
  return units.map((u) => ({ value: u, label: u }));
}
