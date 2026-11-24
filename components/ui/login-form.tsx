"use client";

import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { signInWithGoogle } from "@/lib/actions";
import { Button } from "./button";

const ERRORS: Record<string, string> = {
  AccessDenied: "Tu cuenta no está habilitada. Solicita acceso a un administrador.",
  Configuration: "El inicio de sesión no está disponible. Intenta más tarde.",
  SessionExpired: "Tu sesión expiró o fue revocada. Inicia sesión de nuevo.",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="mt-4 w-full" disabled={pending}>
      {pending ? "Redirigiendo…" : "Continuar con Google"}
    </Button>
  );
}

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const error = searchParams.get("error");
  const errorMessage = error
    ? (ERRORS[error] ?? "No pudimos iniciar sesión. Intenta de nuevo.")
    : null;

  return (
    <form action={signInWithGoogle} className="space-y-3">
      <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <h1 className="mb-3 font-heading text-2xl">Inicia sesión para continuar</h1>
        <p className="text-sm text-muted-foreground">Usa tu cuenta institucional de Google.</p>
        <input type="hidden" name="redirectTo" value={callbackUrl} />
        <SubmitButton />
        <div className="mt-3 min-h-8" aria-live="polite" aria-atomic="true">
          {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
        </div>
      </div>
    </form>
  );
}
