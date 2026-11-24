import { mutate } from "swr";
import { auditUiEvent } from "@/lib/audit/ui-event";
import { MOCK_PROJECTS, PRIORITY, STATUS } from "./mock";
import type { Project, PriorityChange, PriorityChangeInput, ProjectUpdateInput } from "./types";

/** Claves de cache: con SWR seran las URLs de los endpoints. */
export const PROJECTS_KEY = "/projects";
export const PRIORITY_LOG_KEY = "/projects/priority-log";

// Copias en memoria (mock) para que los cambios se vean en todas las vistas.
let projects: Project[] = [...MOCK_PROJECTS];
let priorityLog: PriorityChange[] = [
  {
    id: "01941000-0001-7000-8000-000000000001",
    project: { id: "0193a1b2-0001-7000-8000-000000000001", unique_code: "FACYT-QUI-2026-001", name: "Síntesis de nanopartículas de plata" },
    from_priority: "Alta",
    to_priority: "Crítica",
    user: { id: "u-4", full_name: "Carlos Mendoza" },
    explaining: "El financiamiento externo vence en diciembre y se necesitan los resultados para el informe final.",
    created_at: "2026-10-20T14:10:00Z",
  },
];

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetcher con la firma que espera SWR: (key) => Promise<data>.
 * MAÑANA:
 *   const res = await fetch(`/api${key}`);
 *   if (!res.ok) throw new Error("No se pudieron cargar los proyectos");
 *   return res.json();
 */
export async function projectsFetcher(_key: string): Promise<Project[]> {
  await delay(600);
  return [...projects];
}

/** MAÑANA: fetch(`/api${key}`) -> filas de private.audith_project. */
export async function priorityLogFetcher(_key: string): Promise<PriorityChange[]> {
  await delay();
  return [...priorityLog].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

/**
 * Cambia la prioridad con justificacion obligatoria.
 * MAÑANA: PATCH /api/projects/:id/priority con { id_priority, explaining }.
 * El backend actualiza "Project" e inserta en audith_project en la MISMA transaccion.
 */
export async function changeProjectPriority(input: PriorityChangeInput): Promise<Project> {
  await delay();
  const project = projects.find((p) => p.id === input.id_project);
  const priority = Object.values(PRIORITY).find((p) => p.id === input.id_priority);
  if (!project || !priority) throw new Error("Proyecto o prioridad no válidos.");
  if (project.priority.id === priority.id) throw new Error("El proyecto ya tiene esa prioridad.");

  const now = new Date().toISOString();
  const updated: Project = { ...project, priority, updated_at: now };
  projects = projects.map((p) => (p.id === project.id ? updated : p));
  priorityLog = [
    ...priorityLog,
    {
      id: crypto.randomUUID(),
      project: { id: project.id, unique_code: project.unique_code, name: project.name },
      from_priority: project.priority.name,
      to_priority: priority.name,
      user: { id: "me", full_name: "Usuario actual" }, // el backend lo toma del token
      explaining: input.explaining,
      created_at: now,
    },
  ];
  void mutate(PROJECTS_KEY);
  void mutate(PRIORITY_LOG_KEY);
  auditUiEvent({
    entity: "Project",
    action: "update_priority",
    summary: `${project.unique_code}: ${project.priority.name} → ${priority.name}`,
  });
  return updated;
}

/** Un proyecto finalizado queda cerrado: no se edita. */
export const isProjectLocked = (p: Project) => p.status.name === STATUS.finalizado.name;

/** MAÑANA: fetch(`/api/projects/${id}`) */
export async function getProject(id: string): Promise<Project | null> {
  await delay(300);
  return projects.find((p) => p.id === id) ?? null;
}

/**
 * MAÑANA: PATCH /api/projects/:id con { ...input, updated_at: expectedUpdatedAt }.
 * El backend ignora unique_code y prioridad, y responde 409 si updated_at no coincide.
 */
export async function updateProject(id: string, input: ProjectUpdateInput, expectedUpdatedAt: string): Promise<Project> {
  await delay();
  const project = projects.find((p) => p.id === id);
  if (!project) throw new Error("Proyecto no encontrado.");
  if (isProjectLocked(project)) throw new Error("Un proyecto finalizado no se puede editar.");
  if (project.updated_at !== expectedUpdatedAt) throw new Error("Otra persona modificó este registro mientras lo editabas. Recarga la página para ver los cambios.");
  const status = Object.values(STATUS).find((s) => s.id === input.id_status);
  if (!status) throw new Error("Estatus no válido.");

  const updated: Project = {
    ...project, name: input.name, description: input.description, status, updated_at: new Date().toISOString(),
  };
  projects = projects.map((p) => (p.id === id ? updated : p));
  void mutate(PROJECTS_KEY);
  auditUiEvent({ entity: "Project", action: "update", summary: input.name });
  return updated;
}
