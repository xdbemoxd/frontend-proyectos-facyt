"use server";

import { signIn } from "@/auth";
import { safeRedirectPath } from "@/lib/redirect";

/** Inicia el flujo OAuth con Google. */
export async function signInWithGoogle(formData: FormData) {
  // Solo rutas internas: se resuelve contra AUTH_URL y se exige mismo origen
  // (bloquea //host, /\host, %5C y URLs absolutas).
  const redirectTo = safeRedirectPath(formData.get("redirectTo")?.toString());
  await signIn("google", { redirectTo });
}
