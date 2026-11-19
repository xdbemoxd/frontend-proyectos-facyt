import { z } from "zod";

const optional = (schema: z.ZodString) =>
  z.union([schema, z.literal("")]).transform((v) => (v === "" ? null : v));

export const equipmentSchema = z.object({
  name: z.string().trim().min(2, "Escribe al menos 2 caracteres.").max(150, "Máximo 150 caracteres."),
  description: optional(z.string().trim().max(1000, "Máximo 1000 caracteres.")),
  id_vendors: z.string().min(1, "Elige un proveedor."),
  id_status: z.coerce.number().int().positive("Elige un estado."),
  model: optional(z.string().trim().max(100, "Máximo 100 caracteres.")),
  serial_number: optional(z.string().trim().max(100, "Máximo 100 caracteres.")),
});

export type EquipmentFormErrors = Partial<Record<keyof z.input<typeof equipmentSchema>, string>>;

/** Edición: el proveedor de la unidad no se cambia. */
export const equipmentUpdateSchema = equipmentSchema.omit({ id_vendors: true });

export type EquipmentUpdateErrors = Partial<Record<keyof z.input<typeof equipmentUpdateSchema>, string>>;

/** `datetime-local` ("2026-11-19T08:00") -> ISO con zona. */
const localDateTime = z
  .string()
  .min(1, "Elige fecha y hora.")
  .refine((v) => !Number.isNaN(new Date(v).getTime()), "Fecha no válida.")
  .transform((v) => new Date(v).toISOString());

export const reservationSchema = z
  .object({
    id_equipament_supplier: z.string().min(1, "Elige un equipo."),
    id_project: z.string().min(1, "Elige un proyecto."),
    reservation_date: localDateTime,
    end_date: localDateTime,
    purpose: optional(z.string().trim().max(2000, "Máximo 2000 caracteres.")),
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
