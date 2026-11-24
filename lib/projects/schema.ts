import { z } from "zod"

/** Mismo CHECK que la BD: char_length(trim(explaining)) >= 5, varchar(2000). */
export const priorityChangeSchema = z.object({
  id_project: z.string().min(1),
  id_priority: z.coerce.number().int().positive("Elige la nueva prioridad."),
  explaining: z
    .string()
    .trim()
    .min(5, "La justificación es obligatoria (mínimo 5 caracteres).")
    .max(2000, "Máximo 2000 caracteres."),
})

export type PriorityChangeErrors = Partial<
  Record<"id_priority" | "explaining", string>
>

/** Body que acepta el BFF en PATCH /api/projects/:id/priority (sin id_project). */
export const priorityPatchSchema = priorityChangeSchema.omit({
  id_project: true,
})

const optional = (schema: z.ZodString) =>
  z.union([schema, z.literal("")]).transform((v) => (v === "" ? null : v))

export const projectUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Escribe al menos 3 caracteres.")
    .max(150, "Máximo 150 caracteres."),
  description: optional(z.string().trim().max(255, "Máximo 255 caracteres.")),
  id_status: z.coerce.number().int().positive("Elige un estatus."),
})

export type ProjectUpdateErrors = Partial<
  Record<keyof z.input<typeof projectUpdateSchema>, string>
>

/**
 * Body que acepta el BFF en PATCH /api/projects/:id.
 * Espeja `ProjectUpdate` del backend: nada de unique_code, id_user ni
 * id_priority (la prioridad tiene su propio endpoint auditado).
 */
export const projectPatchSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Escribe al menos 3 caracteres.")
      .max(150, "Máximo 150 caracteres.")
      .optional(),
    description: z
      .string()
      .trim()
      .max(255, "Máximo 255 caracteres.")
      .nullable()
      .optional(),
    id_status: z.coerce.number().int().positive("Elige un estatus.").optional(),
    progress: z.coerce
      .number()
      .min(0, "Mínimo 0.")
      .max(100, "Máximo 100.")
      .optional(),
    budget_execution: z.coerce
      .number()
      .min(0, "Mínimo 0.")
      .max(100, "Máximo 100.")
      .optional(),
    expected_updated_at: z
      .string()
      .min(1, "Falta la versión del registro.")
      .refine(
        (value) => !Number.isNaN(Date.parse(value)),
        "Fecha de versión inválida."
      ),
  })
  .strict()
  .refine(
    (data) =>
      ["name", "description", "id_status", "progress", "budget_execution"].some(
        (field) => data[field as keyof typeof data] !== undefined
      ),
    "Nada que actualizar."
  )
