import { z } from "zod";

/** Mismo CHECK que la BD: char_length(trim(explaining)) >= 5, varchar(2000). */
export const priorityChangeSchema = z.object({
  id_project: z.string().min(1),
  id_priority: z.coerce.number().int().positive("Elige la nueva prioridad."),
  explaining: z
    .string()
    .trim()
    .min(5, "La justificación es obligatoria (mínimo 5 caracteres).")
    .max(2000, "Máximo 2000 caracteres."),
});

export type PriorityChangeErrors = Partial<Record<"id_priority" | "explaining", string>>;

const optional = (schema: z.ZodString) =>
  z.union([schema, z.literal("")]).transform((v) => (v === "" ? null : v));

export const projectUpdateSchema = z.object({
  name: z.string().trim().min(3, "Escribe al menos 3 caracteres.").max(255, "Máximo 255 caracteres."),
  description: optional(z.string().trim().max(2000, "Máximo 2000 caracteres.")),
  id_status: z.coerce.number().int().positive("Elige un estatus."),
});

export type ProjectUpdateErrors = Partial<Record<keyof z.input<typeof projectUpdateSchema>, string>>;
