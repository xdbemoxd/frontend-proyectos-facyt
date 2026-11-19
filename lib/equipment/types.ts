/** Estado operacional (private.status_equipament). */
export type EquipmentStatus = {
  id: number;
  name: string; // Disponible | En uso | En mantenimiento
  description: string | null;
};

/**
 * Unidad fisica de un equipo (private.equipament_supplier) con sus FK
 * resueltas: equipo (private.equipment), proveedor y estado.
 */
export type EquipmentUnit = {
  id: string;
  equipment: { id: string; name: string; description: string | null };
  vendor: { id: string; name: string };
  status: EquipmentStatus;
  model: string | null;
  serial_number: string | null;
  create_at: string;
  updated_at: string;
};

/** Datos del formulario (POST /equipment). */
export type EquipmentInput = {
  name: string;
  description: string | null;
  id_vendors: string;
  id_status: number;
  model: string | null;
  serial_number: string | null;
};

/** Reserva (private.reservation_equipament) con FK resueltas. */
export type Reservation = {
  id: string;
  unit: { id: string; equipment_name: string; serial_number: string | null };
  project: { id: string; unique_code: string; name: string };
  user: { id: string; full_name: string };
  reservation_date: string; // inicio, ISO
  end_date: string; // ISO
  purpose: string | null;
  created_date: string;
};

/** Datos del formulario (POST /equipment/reservations). */
export type ReservationInput = {
  id_equipament_supplier: string;
  id_project: string;
  reservation_date: string; // ISO
  end_date: string; // ISO
  purpose: string | null;
};

/**
 * PATCH /equipment/:id. name y description son del equipo (afectan a todas
 * sus unidades); el resto es de esta unidad. El proveedor no se cambia.
 */
export type EquipmentUpdateInput = {
  name: string;
  description: string | null;
  id_status: number;
  model: string | null;
  serial_number: string | null;
};
