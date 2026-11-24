import { mutate } from "swr"
import type {
  Catalog,
  PriorityChange,
  PriorityChangeInput,
  Project,
  ProjectCatalogs,
  ProjectUpdateInput,
} from "./types"

/** Claves de cache SWR: son las URLs del BFF (mismo origen). */
export const PROJECTS_KEY = "/api/projects?limit=200"
export const PRIORITY_LOG_KEY = "/api/projects/priority-log?limit=100"
export const CATALOGS_KEY = "/api/projects/catalogs"

type RawProject = {
  id: string
  unique_code: string
  name: string
  description: string | null
  status: Catalog
  priority: Catalog
  progress: number | string
  budget_execution: number | string
  user: { id: string; full_name?: string | null; email: string }
  create_at: string
  updated_at: string
}

type RawPriorityChange = {
  id: string
  project: { id: string; unique_code: string; name: string }
  from_priority: string | null
  to_priority: string
  user: { id: string; full_name: string }
  explaining: string
  created_at: string
}

type Paginated<T> = { items: T[] }

function normalizeCatalog(value: Catalog): Catalog {
  return {
    id: Number(value.id),
    name: String(value.name),
    description: value.description ?? null,
  }
}

function normalizeProject(raw: RawProject): Project {
  return {
    id: String(raw.id),
    unique_code: String(raw.unique_code),
    name: String(raw.name),
    description: raw.description ?? null,
    status: normalizeCatalog(raw.status),
    priority: normalizeCatalog(raw.priority),
    progress: Number(raw.progress ?? 0),
    budget_execution: Number(raw.budget_execution ?? 0),
    user: {
      id: String(raw.user.id),
      full_name: raw.user.full_name?.trim() || raw.user.email,
      email: String(raw.user.email),
    },
    create_at: String(raw.create_at),
    updated_at: String(raw.updated_at),
  }
}

function normalizePriorityChange(raw: RawPriorityChange): PriorityChange {
  return {
    id: String(raw.id),
    project: {
      id: String(raw.project.id),
      unique_code: String(raw.project.unique_code),
      name: String(raw.project.name),
    },
    // El primer cambio de un proyecto no tiene prioridad anterior.
    from_priority: raw.from_priority ?? "—",
    to_priority: String(raw.to_priority),
    user: { id: String(raw.user.id), full_name: String(raw.user.full_name) },
    explaining: String(raw.explaining),
    created_at: String(raw.created_at),
  }
}

async function errorFromResponse(
  response: Response,
  fallback: string
): Promise<Error> {
  if (response.status === 401)
    return new Error("Tu sesión expiró. Vuelve a iniciar sesión.")
  if (response.status === 403)
    return new Error("No tienes permiso para esta acción.")

  try {
    const body = (await response.json()) as { detail?: unknown }
    const detail = body?.detail
    if (typeof detail === "string" && detail.trim()) return new Error(detail)
    if (Array.isArray(detail)) {
      const first = detail[0] as { msg?: unknown } | undefined
      if (first && typeof first.msg === "string") return new Error(first.msg)
    }
  } catch {
    /* sin cuerpo JSON */
  }
  return new Error(fallback)
}

async function fetchJson<T>(
  url: string,
  init: RequestInit,
  fallback: string
): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, init)
  } catch {
    throw new Error("No se pudo conectar con el servidor.")
  }
  if (!response.ok) throw await errorFromResponse(response, fallback)
  return (await response.json()) as T
}

/** Fetch con la firma que espera SWR: (key) => Promise<data>. */
export async function projectsFetcher(key: string): Promise<Project[]> {
  const page = await fetchJson<Paginated<RawProject>>(
    key,
    { method: "GET" },
    "No se pudieron cargar los proyectos."
  )
  return page.items.map(normalizeProject)
}

export async function priorityLogFetcher(
  key: string
): Promise<PriorityChange[]> {
  const page = await fetchJson<Paginated<RawPriorityChange>>(
    key,
    { method: "GET" },
    "No se pudo cargar la bitácora."
  )
  return page.items.map(normalizePriorityChange)
}

export async function projectCatalogsFetcher(
  key: string
): Promise<ProjectCatalogs> {
  const catalogs = await fetchJson<ProjectCatalogs>(
    key,
    { method: "GET" },
    "No se pudieron cargar los catálogos."
  )
  return {
    statuses: catalogs.statuses.map(normalizeCatalog),
    priorities: catalogs.priorities.map(normalizeCatalog),
  }
}

/**
 * Cambia la prioridad con justificación obligatoria.
 * El backend actualiza "Project" e inserta en audith_project en la MISMA
 * transacción; aquí solo se refresca la caché SWR tras el 200.
 */
export async function changeProjectPriority(
  input: PriorityChangeInput
): Promise<Project> {
  const updated = await fetchJson<RawProject>(
    `/api/projects/${encodeURIComponent(input.id_project)}/priority`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_priority: input.id_priority,
        explaining: input.explaining,
      }),
    },
    "No se pudo cambiar la prioridad."
  )

  const project = normalizeProject(updated)
  void mutate(PROJECTS_KEY)
  void mutate(PRIORITY_LOG_KEY)
  return project
}

/** Un proyecto finalizado queda cerrado: no se edita. */
export const isProjectLocked = (p: Project) => p.status.name === "Finalizado"

/** GET /api/projects/:id. null si no existe o el id no es válido. */
export async function getProject(id: string): Promise<Project | null> {
  let response: Response
  try {
    response = await fetch(`/api/projects/${encodeURIComponent(id)}`, {
      method: "GET",
    })
  } catch {
    throw new Error("No se pudo conectar con el servidor.")
  }

  if (response.status === 404 || response.status === 422) return null
  if (response.status === 403)
    throw new Error("No tienes permiso para ver este proyecto.")
  if (!response.ok)
    throw await errorFromResponse(response, "No se pudo cargar el proyecto.")

  return normalizeProject((await response.json()) as RawProject)
}

/**
 * PATCH /api/projects/:id con `expected_updated_at` (bloqueo optimista).
 * El backend ignora unique_code/prioridad y responde 409 si la versión cambió.
 */
export async function updateProject(
  id: string,
  input: ProjectUpdateInput,
  expectedUpdatedAt: string
): Promise<Project> {
  const updated = await fetchJson<RawProject>(
    `/api/projects/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...input,
        expected_updated_at: expectedUpdatedAt,
      }),
    },
    "No se pudo guardar el proyecto."
  )

  const project = normalizeProject(updated)
  void mutate(PROJECTS_KEY)
  return project
}
