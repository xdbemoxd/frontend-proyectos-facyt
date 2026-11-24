import { z } from "zod";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const uuid = z.string().regex(UUID_RE, "Identificador inválido.");

const optional = (schema: z.ZodString) =>
  z
    .union([schema, z.literal(""), z.null()])
    .optional()
    .transform((v) => (v === "" || v === null || v === undefined ? null : v));

export const equipmentSchema = z.object({
  name: z.string().trim().min(2, "Escribe al menos 2 caracteres.").max(150, "Máximo 150 caracteres."),
  description: optional(z.string().trim().max(1000, "Máximo 1000 caracteres.")),
  id_vendors: uuid,
  id_status: z.coerce.number().int().positive("Elige un estado."),
  model: optional(z.string().trim().max(100, "Máximo 100 caracteres.")),
  serial_number: optional(z.string().trim().max(100, "Máximo 100 caracteres.")),
});

export type EquipmentFormErrors = Partial<Record<keyof z.input<typeof equipmentSchema>, string>>;

/** Edición: el proveedor de la unidad no se cambia. */
export const equipmentUpdateSchema = equipmentSchema.omit({ id_vendors: true });

export type EquipmentUpdateErrors = Partial<Record<keyof z.input<typeof equipmentUpdateSchema>, string>>;

/** ISO con zona (o parseable por Date) -> ISO UTC. */
const isoDateTime = z
  .string()
  .min(1, "Elige fecha y hora.")
  .refine((v) => !Number.isNaN(new Date(v).getTime()), "Fecha no válida.")
  .transform((v) => new Date(v).toISOString());

/** `datetime-local` ("2026-11-19T08:00") -> ISO con zona. */
const localDateTime = z
  .string()
  .min(1, "Elige fecha y hora.")
  .refine((v) => !Number.isNaN(new Date(v).getTime()), "Fecha no válida.")
  .transform((v) => new Date(v).toISOString());

const reservationFields = {
  id_equipament_supplier: uuid,
  id_project: uuid,
  purpose: optional(z.string().trim().max(2000, "Máximo 2000 caracteres.")),
};

/** Formulario: exige que la reserva empiece en el futuro. */
export const reservationSchema = z
  .object({
    ...reservationFields,
    reservation_date: localDateTime,
    end_date: localDateTime,
  })
  .refine((d) => d.end_date > d.reservation_date, {
    path: ["end_date"],
    message: "La fecha de fin debe ser posterior al inicio.",
  })
  .refine((d) => new Date(d.reservation_date).getTime() > Date.now(), {
    path: ["reservation_date"],
    message: "La reserva debe empezar en el futuro.",
  });

export type ReservationFormErrors = Partial<Record<keyof z.input<typeof reservationSchema>, string>>;

/**
 * BFF: valida lo mismo que el backend (rango fin > inicio) sin imponer la
 * regla de UI "debe empezar en el futuro". Normaliza las fechas a ISO UTC.
 */
export const reservationRequestSchema = z
  .object({
    ...reservationFields,
    reservation_date: isoDateTime,
    end_date: isoDateTime,
  })
  .refine((d) => d.end_date > d.reservation_date, {
    path: ["end_date"],
    message: "La fecha de fin debe ser posterior al inicio.",
  });

/** BFF del PATCH: campos opcionales + version esperada obligatoria. */
export const equipmentPatchSchema = equipmentUpdateSchema.partial().extend({
  expected_updated_at: isoDateTime,
});
