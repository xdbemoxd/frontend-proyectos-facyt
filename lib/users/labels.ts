/** Etiqueta corta para un rol del backend. */
export function roleLabel(name: string | null | undefined): string {
  if (!name) return "Sin rol";
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  if (normalized.startsWith("admin")) return "Administrador";
  if (normalized.startsWith("aprob")) return "Aprobador / Gestor de inventario";
  if (normalized.startsWith("coord")) return "Coordinador de proyecto";
  return name;
}
