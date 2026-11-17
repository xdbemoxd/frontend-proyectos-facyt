import type { Catalog, Project } from "./types";

export const STATUS: Record<string, Catalog> = {
  propuesta: { id: 1, name: "Propuesta", description: "Proyecto en evaluación" },
  ejecucion: { id: 2, name: "En ejecución", description: "Proyecto activo" },
  suspendido: { id: 3, name: "Suspendido", description: "Detenido temporalmente" },
  finalizado: { id: 4, name: "Finalizado", description: "Proyecto cerrado" },
};

export const PRIORITY: Record<string, Catalog> = {
  critica: { id: 1, name: "Crítica", description: null },
  alta: { id: 2, name: "Alta", description: null },
  media: { id: 3, name: "Media", description: null },
  baja: { id: 4, name: "Baja", description: null },
};

export const MOCK_PROJECTS: Project[] = [
  {
    id: "0193a1b2-0001-7000-8000-000000000001",
    unique_code: "FACYT-QUI-2026-001",
    name: "Síntesis de nanopartículas de plata",
    description: "Obtención por reducción química para uso antimicrobiano.",
    status: STATUS.ejecucion,
    priority: PRIORITY.critica,
    progress: 62.5,
    budget_execution: 48.3,
    user: { id: "u-1", full_name: "María Rivas", email: "mrivas@uc.edu.ve" },
    create_at: "2026-02-10T13:00:00Z",
    updated_at: "2026-11-12T15:30:00Z",
  },
  {
    id: "0193a1b2-0002-7000-8000-000000000002",
    unique_code: "FACYT-BIO-2026-004",
    name: "Biorremediación de suelos contaminados",
    description: "Uso de consorcios bacterianos en suelos con hidrocarburos.",
    status: STATUS.propuesta,
    priority: PRIORITY.alta,
    progress: 0,
    budget_execution: 0,
    user: { id: "u-2", full_name: "José Pérez", email: "jperez@uc.edu.ve" },
    create_at: "2026-10-01T12:00:00Z",
    updated_at: "2026-10-01T12:00:00Z",
  },
  {
    id: "0193a1b2-0003-7000-8000-000000000003",
    unique_code: "FACYT-FIS-2025-012",
    name: "Caracterización de películas delgadas",
    description: null,
    status: STATUS.suspendido,
    priority: PRIORITY.media,
    progress: 35,
    budget_execution: 71.2,
    user: { id: "u-3", full_name: "Ana Gómez", email: "agomez@uc.edu.ve" },
    create_at: "2025-06-20T10:00:00Z",
    updated_at: "2026-08-05T09:15:00Z",
  },
  {
    id: "0193a1b2-0004-7000-8000-000000000004",
    unique_code: "FACYT-QUI-2025-007",
    name: "Extracción de aceites esenciales",
    description: "Destilación por arrastre de vapor de especies locales.",
    status: STATUS.finalizado,
    priority: PRIORITY.baja,
    progress: 100,
    budget_execution: 96.8,
    user: { id: "u-1", full_name: "María Rivas", email: "mrivas@uc.edu.ve" },
    create_at: "2025-01-15T14:00:00Z",
    updated_at: "2026-03-30T17:45:00Z",
  },
];
