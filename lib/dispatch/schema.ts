import { z } from "zod";

export const dispatchSchema = z.object({
  id_raw_materials_suppliers: z.string().min(1, "Elige el material y su proveedor."),
  id_project: z.string().min(1, "Elige el proyecto destino."),
  // Mismo CHECK que la BD: cantidad > 0
  use_raw_materials: z.coerce
    .number({ message: "Escribe un número." })
    .gt(0, "La cantidad debe ser mayor que 0.")
    .max(999_999_999_999.99, "Número demasiado grande."),
  notes: z
    .union([z.string().trim().max(1000, "Máximo 1000 caracteres."), z.literal("")])
    .transform((v) => (v === "" ? null : v)),
});

export type DispatchFormErrors = Partial<Record<keyof z.input<typeof dispatchSchema>, string>>;
