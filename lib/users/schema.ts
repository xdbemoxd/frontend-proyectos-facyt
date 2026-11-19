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

export type UserCreateErrors = Partial<Record<"email" | "id_rol", string>>;
export type UserUpdateErrors = Partial<Record<"id_rol" | "is_active", string>>;
