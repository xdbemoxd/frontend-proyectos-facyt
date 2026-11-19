import { z } from "zod";

const optional = (schema: z.ZodString) =>
  z.union([schema, z.literal("")]).transform((v) => (v === "" ? null : v));

export const rawMaterialSchema = z.object({
  name: z.string().trim().min(2, "Escribe al menos 2 caracteres.").max(255, "Máximo 255 caracteres."),
  description: optional(z.string().trim().max(1000, "Máximo 1000 caracteres.")),
  resource_type_id: z.coerce.number().int().positive("Elige un tipo."),
  unit: z.string().trim().min(1, "Elige una unidad.").max(30),
  vendors_id: z.string().min(1, "Elige un proveedor."),
  minimun_stock: z.coerce
    .number({ message: "Escribe un número." })
    .min(0, "No puede ser negativo.")
    .max(999_999_999_999.99, "Número demasiado grande."),
});

export type RawMaterialFormErrors = Partial<Record<keyof z.input<typeof rawMaterialSchema>, string>>;

/** Edición: el proveedor y el stock no se tocan. */
export const rawMaterialUpdateSchema = rawMaterialSchema.pick({
  name: true, resource_type_id: true, unit: true, minimun_stock: true,
});

export type RawMaterialUpdateErrors = Partial<Record<keyof z.input<typeof rawMaterialUpdateSchema>, string>>;
