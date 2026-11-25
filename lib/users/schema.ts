import { z } from "zod";

/** Dominio permitido (opcional). Debe coincidir con GOOGLE_ALLOWED_DOMAIN del backend. */
const ALLOWED_DOMAIN = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN || null;

export const userCreateSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Correo no válido.")
    .max(255)
    .refine((v) => !ALLOWED_DOMAIN || v.endsWith(`@${ALLOWED_DOMAIN}`), {
      message: ALLOWED_DOMAIN ? `Debe ser un correo @${ALLOWED_DOMAIN}.` : "",
    }),
  id_rol: z.string().min(1, "Elige un rol."),
});

export const userUpdateSchema = z.object({
  id_rol: z.string().min(1, "Elige un rol."),
  is_active: z.union([z.literal("on"), z.literal("true"), z.undefined()]).transform((v) => v !== undefined),
});

/**
 * Body que acepta el BFF en PATCH /api/users/:id.
 * Espeja `UserUpdate` del backend: nada de email, id, rol resuelto ni
 * campos internos (mass assignment).
 */
export const userPatchSchema = z
  .object({
    name: z.string().trim().max(255, "Máximo 255 caracteres.").nullable().optional(),
    lastname: z.string().trim().max(255, "Máximo 255 caracteres.").nullable().optional(),
    id_rol: z.uuid("Rol inválido.").optional(),
    is_active: z.boolean().optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.name !== undefined ||
      data.lastname !== undefined ||
      data.id_rol !== undefined ||
      data.is_active !== undefined,
    "Nada que actualizar."
  );

export type UserCreateErrors = Partial<Record<"email" | "id_rol", string>>;
export type UserUpdateErrors = Partial<Record<"id_rol" | "is_active", string>>;
