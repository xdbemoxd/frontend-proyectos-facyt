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
