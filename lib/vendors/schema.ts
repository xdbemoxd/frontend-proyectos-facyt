import { z } from "zod";

/** Campo opcional: "" se guarda como null. */
const optional = (schema: z.ZodString) =>
  z.union([schema, z.literal("")]).transform((v) => (v === "" ? null : v));

/** Mismas reglas que la tabla (largos) + formato de correo/telefono. */
export const vendorSchema = z.object({
  name: z.string().trim().min(2, "Escribe al menos 2 caracteres.").max(150, "Máximo 150 caracteres."),
  description: optional(z.string().trim().max(255, "Máximo 255 caracteres.")),
  contact_email: optional(z.string().trim().email("Correo no válido.").max(255)),
  contact_phone: optional(
    z
      .string()
      .trim()
      .max(20, "Máximo 20 caracteres.")
      .regex(/^[+\d][\d\s()-]{6,}$/, "Teléfono no válido. Ej: +58 414-1234567"),
  ),
});

export type VendorFormErrors = Partial<Record<keyof z.input<typeof vendorSchema>, string>>;

/** PATCH /api/vendors/:id: los mismos campos + bloqueo optimista. */
export const vendorUpdateSchema = vendorSchema.extend({
  expected_updated_at: z.string().min(1, "Falta la versión del registro."),
});

export type VendorUpdateErrors = Partial<
  Record<keyof z.input<typeof vendorUpdateSchema>, string>
>;
