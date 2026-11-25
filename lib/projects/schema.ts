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
  /**
   * Solo el administrador puede cambiar el estatus. Para el coordinador el
   * campo no se renderiza y el BFF/backend lo rechazan.
   */
  id_status: z.coerce.number().int().positive("Elige un estatus.").optional(),
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

/** Siglas del área: 2 a 6 letras (QUI, BIO, FIS…). */
const areaCode = z
  .string()
  .trim()
  .regex(/^[A-Za-z]{2,6}$/, "Usa de 2 a 6 letras, sin números ni espacios. Ej: QUI")
  .transform((v) => v.toUpperCase())

/** Formulario de alta (FormData). `id_user` solo lo trae el administrador. */
export const projectCreateSchema = z.object({
  area_code: areaCode,
  name: z
    .string()
    .trim()
    .min(3, "Escribe al menos 3 caracteres.")
    .max(150, "Máximo 150 caracteres."),
  description: optional(z.string().trim().max(255, "Máximo 255 caracteres.")),
  id_user: z
    .string()
    .optional()
    .transform((v) => (v ? v : undefined)),
})

export type ProjectCreateErrors = Partial<
  Record<keyof z.input<typeof projectCreateSchema>, string>
>

/** Body que acepta el BFF en POST /api/projects (espeja ProjectCreate). */
export const projectPostSchema = z
  .object({
    area_code: areaCode,
    name: z.string().trim().min(3).max(150),
    description: z.string().trim().max(255).nullable().optional(),
    id_user: z.string().uuid("Coordinador inválido.").optional(),
  })
  .strict()

