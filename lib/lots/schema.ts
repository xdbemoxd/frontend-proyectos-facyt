import { z } from "zod";

export const lotSchema = z.object({
  id_raw_materials_supplier: z.string().min(1, "Elige el material y su proveedor."),
  in_date: z
    .string()
    .min(1, "Elige la fecha de ingreso.")
    .refine((v) => !Number.isNaN(new Date(v).getTime()), "Fecha no válida.")
    .refine((v) => new Date(v).getTime() <= Date.now(), "La fecha de ingreso no puede ser futura.")
    .transform((v) => new Date(v).toISOString()),
  // Mismos CHECK que la BD: cantidad > 0, costo >= 0
  count_raw_materials_in: z.coerce
    .number({ message: "Escribe un número." })
    .gt(0, "La cantidad debe ser mayor que 0.")
    .max(999_999_999_999.99, "Número demasiado grande."),
  unit_cost: z.coerce
    .number({ message: "Escribe un número." })
    .min(0, "El costo no puede ser negativo.")
    .max(999_999_999_999.99, "Número demasiado grande."),
  invoice_reference: z
    .union([z.string().trim().max(100, "Máximo 100 caracteres."), z.literal("")])
    .transform((v) => (v === "" ? null : v)),
});

export type LotFormErrors = Partial<Record<keyof z.input<typeof lotSchema>, string>>;
