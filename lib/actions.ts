"use server";

import { signIn } from "@/auth";

/** Inicia el flujo OAuth con Google. */
export async function signInWithGoogle(formData: FormData) {
  const redirectTo = formData.get("redirectTo")?.toString() || "/dashboard";
  // Solo rutas internas (evita open redirect).
  const safe = redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/dashboard";
  await signIn("google", { redirectTo: safe });
}
