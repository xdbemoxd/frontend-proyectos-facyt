"use server";

import { revalidatePath } from "next/cache";
import { userCreateSchema, type UserCreateErrors } from "@/lib/users/schema";
import { z } from "zod";
import { patchUser, postUser } from "@/services/users.service";

/** Estado del formulario (useActionState). */
export type CreateUserState =
  | { status: "idle" }
  | { status: "error"; message?: string; fieldErrors?: UserCreateErrors; values: { email: string; id_rol: string } }
  | { status: "success"; email: string };

/**
 * Recibe el FormData del formulario, valida en el servidor (no se confía
 * en el navegador) y llama al service. Solo se envían correo y rol.
 */
export async function createUserAction(_prev: CreateUserState, formData: FormData): Promise<CreateUserState> {
  const values = {
    email: String(formData.get("email") ?? ""),
    id_rol: String(formData.get("id_rol") ?? ""),
  };

  const parsed = userCreateSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: UserCreateErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof UserCreateErrors;
      fieldErrors[key] ??= issue.message;
    }
    return { status: "error", fieldErrors, values };
  }

  const result = await postUser(parsed.data);
  if (!result.ok) {
    // 409: el error es del campo correo.
    if (result.status === 409) return { status: "error", fieldErrors: { email: result.error }, values };
    return { status: "error", message: result.error, values };
  }

  revalidatePath("/dashboard/users");
  return { status: "success", email: parsed.data.email };
}

const updateSchema = z.object({
  id_rol: z.string().min(1, "Elige un rol."),
  is_active: z.boolean(),
});

export type UpdateUserResult = { ok: true } | { ok: false; error: string };

/** Cambia rol y/o estado. Valida de nuevo en el servidor. */
export async function updateUserAction(id: string, input: { id_rol: string; is_active: boolean }): Promise<UpdateUserResult> {
  try {
    const parsed = updateSchema.safeParse(input);
    if (!parsed.success || !id) return { ok: false, error: "Datos no válidos." };

    const result = await patchUser(id, parsed.data);
    if (!result.ok) return { ok: false, error: result.error };

    return { ok: true };
  } catch (err) {
    // Muestra la causa real en la terminal de `npm run dev`.
    console.error("[updateUserAction]", err);
    const detail = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    return { ok: false, error: `Error en el servidor: ${detail}` };
  }
}
