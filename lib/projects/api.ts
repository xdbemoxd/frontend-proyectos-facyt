import { MOCK_PROJECTS } from "./mock";
import type { Project } from "./types";

/** Clave de cache: con SWR sera la URL del endpoint. */
export const PROJECTS_KEY = "/projects";

/**
 * Fetcher con la firma que espera SWR: (key) => Promise<data>.
 *
 * HOY: devuelve el mock con una latencia simulada.
 * MAÑANA: reemplaza el cuerpo por el fetch real, p. ej.
 *   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${key}`, {
 *     headers: { Authorization: `Bearer ${token}` },
 *   });
 *   if (!res.ok) throw new Error("No se pudieron cargar los proyectos");
 *   return res.json();
 */
export async function projectsFetcher(_key: string): Promise<Project[]> {
  await new Promise((r) => setTimeout(r, 600));
  return MOCK_PROJECTS;
}
