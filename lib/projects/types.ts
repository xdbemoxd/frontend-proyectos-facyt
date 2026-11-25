/** Catalogo (status_project / priority_project). */
export type Catalog = {
  id: number;
  name: string;
  description: string | null;
};

/**
 * Proyecto tal como lo devolvera el endpoint GET /projects.
 * Espejo de private."Project" con las FK ya resueltas (status, priority, user).
 */
export type Project = {
  id: string;
  unique_code: string;
  name: string;
  description: string | null;
  status: Catalog;
  priority: Catalog;
  progress: number; // 0-100
  budget_execution: number; // 0-100
  user: {
    id: string;
    full_name: string;
    email: string;
  };
  create_at: string; // ISO
  updated_at: string; // ISO
};

/** Fila de private.audith_project (historial de cambios de prioridad). */
export type PriorityChange = {
  id: string;
  project: { id: string; unique_code: string; name: string };
  from_priority: string;
  to_priority: string;
  user: { id: string; full_name: string };
  explaining: string;
  created_at: string; // ISO
};

/** PATCH /projects/:id/priority */
export type PriorityChangeInput = {
  id_project: string;
  id_priority: number;
  explaining: string;
};

/**
 * PATCH /projects/:id. El código y la prioridad NO van aquí
 * (la prioridad se cambia con PATCH /projects/:id/priority y queda auditada).
 */
export type ProjectUpdateInput = {
  name: string;
  description: string | null;
  id_status: number;
  progress?: number; // 0-100
  budget_execution?: number; // 0-100
};

/** Catálogos reales que expone el backend para editar y priorizar. */
export type ProjectCatalogs = {
  statuses: Catalog[];
  priorities: Catalog[];
};

/**
 * POST /projects. El backend arma el código ({AREA}-{AÑO}-{NNN}) y deja el
 * proyecto en "Propuesta" con prioridad "Media".
 * `id_user` lo envía solo el administrador (coordinador responsable).
 */
export type ProjectCreateInput = {
  area_code: string;
  name: string;
  description: string | null;
  id_user?: string;
};

/** Coordinador activo que puede ser responsable de un proyecto. */
export type Coordinator = {
  id: string;
  full_name: string;
  email: string;
};

