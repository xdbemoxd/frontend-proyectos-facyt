import { MOCK_PROJECTS } from "@/lib/projects/mock";
import { MOCK_VENDORS } from "@/lib/vendors/mock";
import { EQUIPMENT_STATUS, MOCK_RESERVATIONS, MOCK_UNITS } from "./mock";
import type { EquipmentInput, EquipmentUnit, EquipmentUpdateInput, Reservation, ReservationInput } from "./types";

/** Claves de cache: con SWR seran las URLs de los endpoints. */
export const EQUIPMENT_KEY = "/equipment";
export const RESERVATIONS_KEY = "/equipment/reservations";

// Copias en memoria para que los registros nuevos se vean en los listados.
let units: EquipmentUnit[] = [...MOCK_UNITS];
let reservations: Reservation[] = [...MOCK_RESERVATIONS];

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

/**
 * MAÑANA: const res = await fetch(`/api${key}`); if (!res.ok) throw ...; return res.json();
 */
export async function equipmentFetcher(_key: string): Promise<EquipmentUnit[]> {
  await delay();
  return [...units].sort((a, b) => a.equipment.name.localeCompare(b.equipment.name, "es"));
}

/** MAÑANA: POST /api/equipment con `input` en el body. */
export async function createEquipment(input: EquipmentInput): Promise<EquipmentUnit> {
  await delay();
  if (input.serial_number && units.some((u) => u.serial_number === input.serial_number)) {
    throw new Error("Ya existe un equipo con ese número de serie.");
  }
  const vendor = MOCK_VENDORS.find((v) => v.id === input.id_vendors);
  const status = EQUIPMENT_STATUS.find((s) => s.id === input.id_status);
  if (!vendor || !status) throw new Error("Proveedor o estado no válido.");

  const now = new Date().toISOString();
  // Si ya existe un equipo con ese nombre, la unidad nueva se asocia a el.
  const existing = units.find((u) => u.equipment.name.toLowerCase() === input.name.toLowerCase());
  const unit: EquipmentUnit = {
    id: crypto.randomUUID(),
    equipment: existing?.equipment ?? { id: crypto.randomUUID(), name: input.name, description: input.description },
    vendor: { id: vendor.id, name: vendor.name },
    status,
    model: input.model,
    serial_number: input.serial_number,
    create_at: now,
    updated_at: now,
  };
  units = [...units, unit];
  return unit;
}

/** MAÑANA: fetch(`/api${key}`). */
export async function reservationsFetcher(_key: string): Promise<Reservation[]> {
  await delay();
  return [...reservations].sort((a, b) => a.reservation_date.localeCompare(b.reservation_date));
}

/**
 * MAÑANA: POST /api/equipment/reservations. El backend (restriccion de
 * exclusion en la BD) respondera 409 si hay choque de horario.
 */
export async function createReservation(input: ReservationInput): Promise<Reservation> {
  await delay();
  const unit = units.find((u) => u.id === input.id_equipament_supplier);
  const project = MOCK_PROJECTS.find((p) => p.id === input.id_project);
  if (!unit || !project) throw new Error("Equipo o proyecto no válido.");
  if (unit.status.name === "En mantenimiento") {
    throw new Error("El equipo está en mantenimiento y no se puede reservar.");
  }

  // Mismo criterio que la BD: inicio_nuevo < fin AND fin_nuevo > inicio
  const conflict = reservations.find(
    (r) =>
      r.unit.id === unit.id &&
      input.reservation_date < r.end_date &&
      input.end_date > r.reservation_date,
  );
  if (conflict) {
    throw new Error(
      `El equipo ya está reservado en ese horario por el proyecto ${conflict.project.unique_code}.`,
    );
  }

  const reservation: Reservation = {
    id: crypto.randomUUID(),
    unit: { id: unit.id, equipment_name: unit.equipment.name, serial_number: unit.serial_number },
    project: { id: project.id, unique_code: project.unique_code, name: project.name },
    user: { id: "me", full_name: "Usuario actual" }, // el backend lo toma del token
    reservation_date: input.reservation_date,
    end_date: input.end_date,
    purpose: input.purpose,
    created_date: new Date().toISOString(),
  };
  reservations = [...reservations, reservation];
  return reservation;
}

/** MAÑANA: fetch(`/api/equipment/${id}`) */
export async function getEquipment(id: string): Promise<EquipmentUnit | null> {
  await delay(300);
  return units.find((u) => u.id === id) ?? null;
}

/** Reservas de la unidad que aún no terminan. */
export function upcomingReservations(unitId: string): Reservation[] {
  const now = new Date().toISOString();
  return reservations.filter((r) => r.unit.id === unitId && r.end_date > now);
}

/**
 * MAÑANA: PATCH /api/equipment/:id con { ...input, updated_at: expectedUpdatedAt }.
 * El backend responde 409 si el serial se repite, si updated_at no coincide
 * o si se pasa a mantenimiento con reservas pendientes.
 */
export async function updateEquipment(id: string, input: EquipmentUpdateInput, expectedUpdatedAt: string): Promise<EquipmentUnit> {
  await delay();
  const unit = units.find((u) => u.id === id);
  if (!unit) throw new Error("Equipo no encontrado.");
  if (unit.updated_at !== expectedUpdatedAt) throw new Error("Otra persona modificó este registro mientras lo editabas. Recarga la página para ver los cambios.");
  const status = EQUIPMENT_STATUS.find((s) => s.id === input.id_status);
  if (!status) throw new Error("Estado no válido.");
  if (input.serial_number && units.some((u) => u.id !== id && u.serial_number === input.serial_number)) {
    throw new Error("Ya existe un equipo con ese número de serie.");
  }
  if (status.name === "En mantenimiento" && unit.status.name !== "En mantenimiento") {
    const pending = upcomingReservations(id);
    if (pending.length > 0) {
      throw new Error(
        `No se puede pasar a mantenimiento: tiene ${pending.length} reserva(s) pendiente(s). Reprográmalas primero.`,
      );
    }
  }

  const now = new Date().toISOString();
  const equipment = { ...unit.equipment, name: input.name, description: input.description };
  units = units.map((u) => {
    if (u.id === id) {
      return { ...u, equipment, status, model: input.model, serial_number: input.serial_number, updated_at: now };
    }
    return u.equipment.id === unit.equipment.id ? { ...u, equipment } : u;
  });
  return units.find((u) => u.id === id)!;
}
