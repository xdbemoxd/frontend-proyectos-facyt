import { mutate } from "swr";
import { auditUiEvent } from "@/lib/audit/ui-event";
import { fetchJson } from "@/lib/http";
import type {
  EquipmentCatalogs,
  EquipmentInput,
  EquipmentStatus,
  EquipmentUnit,
  EquipmentUpdateInput,
  Reservation,
  ReservationInput,
} from "./types";

/** Claves SWR: URLs del BFF (mismo origen, reenvía el Bearer de la sesión). */
export const EQUIPMENT_KEY = "/api/equipment?limit=200";
export const RESERVATIONS_KEY = "/api/equipment/reservations?limit=200";
export const EQUIPMENT_CATALOGS_KEY = "/api/equipment/catalogs";

type Paginated<T> = { items: T[]; total: number; limit: number; offset: number };

function normalizeStatus(raw: EquipmentStatus): EquipmentStatus {
  return {
    id: Number(raw.id),
    name: String(raw.name),
    description: raw.description ?? null,
  };
}

function normalizeEquipment(raw: EquipmentUnit): EquipmentUnit {
  return {
    id: String(raw.id),
    equipment: {
      id: String(raw.equipment.id),
      name: String(raw.equipment.name),
      description: raw.equipment.description ?? null,
    },
    vendor: { id: String(raw.vendor.id), name: String(raw.vendor.name) },
    status: normalizeStatus(raw.status),
    model: raw.model ?? null,
    serial_number: raw.serial_number ?? null,
    create_at: String(raw.create_at),
    updated_at: String(raw.updated_at),
    pending_reservations: Number(raw.pending_reservations ?? 0),
  };
}

function normalizeReservation(raw: Reservation): Reservation {
  return {
    id: String(raw.id),
    unit: {
      id: String(raw.unit.id),
      equipment_name: String(raw.unit.equipment_name),
      serial_number: raw.unit.serial_number ?? null,
    },
    project: {
      id: String(raw.project.id),
      unique_code: String(raw.project.unique_code),
      name: String(raw.project.name),
    },
    user: { id: String(raw.user.id), full_name: String(raw.user.full_name) },
    reservation_date: String(raw.reservation_date),
    end_date: String(raw.end_date),
    purpose: raw.purpose ?? null,
    created_date: String(raw.created_date),
  };
}

/** Fetcher con la firma de SWR: (key) => Promise<EquipmentUnit[]>. */
export async function equipmentFetcher(key: string): Promise<EquipmentUnit[]> {
  const page = await fetchJson<Paginated<EquipmentUnit>>(
    key,
    { method: "GET" },
    "No se pudieron cargar los equipos."
  );
  return page.items.map(normalizeEquipment);
}

export async function reservationsFetcher(key: string): Promise<Reservation[]> {
  const page = await fetchJson<Paginated<Reservation>>(
    key,
    { method: "GET" },
    "No se pudieron cargar las reservas."
  );
  return page.items.map(normalizeReservation);
}

export async function equipmentCatalogsFetcher(
  key: string
): Promise<EquipmentCatalogs> {
  const catalogs = await fetchJson<EquipmentCatalogs>(
    key,
    { method: "GET" },
    "No se pudieron cargar los catálogos."
  );
  return {
    statuses: (catalogs.statuses ?? []).map(normalizeStatus),
    vendors: (catalogs.vendors ?? []).map((v) => ({
      id: String(v.id),
      name: String(v.name),
    })),
  };
}

/** POST /api/equipment (solo admin/aprobador). */
export async function createEquipment(
  input: EquipmentInput
): Promise<EquipmentUnit> {
  const created = await fetchJson<EquipmentUnit>(
    "/api/equipment",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    "No se pudo guardar el equipo."
  );

  const unit = normalizeEquipment(created);
  void mutate(EQUIPMENT_KEY);
  auditUiEvent({ entity: "Equipment", action: "create", summary: unit.equipment.name });
  return unit;
}

/** GET /api/equipment/:id. null si no existe o el id no es válido. */
export async function getEquipment(id: string): Promise<EquipmentUnit | null> {
  let response: Response;
  try {
    response = await fetch(`/api/equipment/${encodeURIComponent(id)}`, {
      method: "GET",
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }

  if (response.status === 404 || response.status === 422) return null;
  if (response.status === 403)
    throw new Error("No tienes permiso para ver este equipo.");
  if (!response.ok) throw new Error("No se pudo cargar el equipo.");
  return normalizeEquipment((await response.json()) as EquipmentUnit);
}

/**
 * PATCH /api/equipment/:id con `expected_updated_at` (bloqueo optimista).
 * El backend responde 409 si el serial se repite, si la versión cambió o si
 * se intenta pasar a mantenimiento con reservas pendientes.
 */
export async function updateEquipment(
  id: string,
  input: EquipmentUpdateInput,
  expectedUpdatedAt: string
): Promise<EquipmentUnit> {
  const updated = await fetchJson<EquipmentUnit>(
    `/api/equipment/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...input,
        expected_updated_at: expectedUpdatedAt,
      }),
    },
    "No se pudo guardar el equipo."
  );

  const unit = normalizeEquipment(updated);
  void mutate(EQUIPMENT_KEY);
  auditUiEvent({ entity: "Equipment", action: "update", summary: unit.equipment.name });
  return unit;
}

/**
 * POST /api/equipment/reservations.
 * La BD rechaza el solape (409); el backend lo traduce sin filtrar SQL.
 */
export async function createReservation(
  input: ReservationInput
): Promise<Reservation> {
  const created = await fetchJson<Reservation>(
    "/api/equipment/reservations",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    "No se pudo guardar la reserva."
  );

  const reservation = normalizeReservation(created);
  void mutate(RESERVATIONS_KEY);
  void mutate(EQUIPMENT_KEY);
  auditUiEvent({
    entity: "Reservation",
    action: "reserve",
    summary: `${reservation.unit.equipment_name} para ${reservation.project.unique_code}`,
  });
  return reservation;
}
