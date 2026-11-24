import { z } from "zod";

export const expenseSchema = z
  .object({
    id_project: z.string().uuid("Elige el proyecto."),
    id_raw_materials_suppliers: z
      .union([z.string().uuid("Material no válido."), z.literal("")])
      .transform((v) => (v === "" ? null : v)),
    description: z
      .string()
      .trim()
      .min(5, "Describe la solicitud (mínimo 5 caracteres).")
      .max(255, "Máximo 255 caracteres."),
    // Mismo CHECK que la BD: count_raw_materials > 0 y 2 decimales.
    count_raw_materials: z.coerce
      .number({ message: "Escribe un número." })
      .gt(0, "La cantidad debe ser mayor que 0.")
      .max(999_999_999_999.99, "Número demasiado grande."),
  })
  .strict();

export type ExpenseFormErrors = Partial<Record<keyof z.input<typeof expenseSchema>, string>>;

/** PATCH /expenses/:id/status: solo el código destino. */
export const expenseStatusSchema = z
  .object({
    status: z.enum(["pending", "approved", "rejected", "executed"]),
  })
  .strict();
