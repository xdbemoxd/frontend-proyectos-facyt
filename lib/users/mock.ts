import type { AppUser, Role } from "./types";

export const MOCK_ROLES: Role[] = [
  { id: "rol-admin", name: "admin_sistema", description: "Administrador del sistema" },
  { id: "rol-aprob", name: "aprobador", description: "Aprobador / Gestor de inventario" },
  { id: "rol-coord", name: "coordinador", description: "Coordinador de proyecto" },
];

export const ROLE_LABELS: Record<string, string> = {
  admin_sistema: "Administrador",
  aprobador: "Aprobador",
  coordinador: "Coordinador",
};

const [ADMIN, APROB, COORD] = MOCK_ROLES;

export const MOCK_USERS: AppUser[] = [
  { id: "u-4", email: "cmendoza@uc.edu.ve", name: "Carlos", lastname: "Mendoza", is_active: true,
    rol: { id: ADMIN.id, name: ADMIN.name }, create_at: "2026-01-05T13:00:00Z" },
  { id: "u-5", email: "lsilva@uc.edu.ve", name: "Laura", lastname: "Silva", is_active: true,
    rol: { id: APROB.id, name: APROB.name }, create_at: "2026-01-20T14:00:00Z" },
  { id: "u-1", email: "mrivas@uc.edu.ve", name: "María", lastname: "Rivas", is_active: true,
    rol: { id: COORD.id, name: COORD.name }, create_at: "2026-02-01T12:00:00Z" },
  { id: "u-2", email: "jperez@uc.edu.ve", name: "José", lastname: "Pérez", is_active: true,
    rol: { id: COORD.id, name: COORD.name }, create_at: "2026-02-10T12:00:00Z" },
  { id: "u-3", email: "agomez@uc.edu.ve", name: "Ana", lastname: "Gómez", is_active: false,
    rol: { id: COORD.id, name: COORD.name }, create_at: "2025-06-15T12:00:00Z" },
  { id: "u-6", email: "rtorres@uc.edu.ve", name: null, lastname: null, is_active: false,
    rol: { id: COORD.id, name: COORD.name }, create_at: "2026-11-17T15:00:00Z" },
];
