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
