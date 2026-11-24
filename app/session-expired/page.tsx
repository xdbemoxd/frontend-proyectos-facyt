import type { Metadata } from "next";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { AuditMotif, InventoryMotif, OverviewMotif, ProjectsMotif } from "@/components/decor/motifs";
import { GoogleIcon } from "@/components/icons/google-icon";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/lib/actions";

export const metadata: Metadata = { title: "Sesión expirada" };

export default function SessionExpiredPage() {
  return (
    <main className="relative flex min-h-[calc(100vh-3.5rem)] items-center justify-center overflow-hidden px-6 py-16">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <OverviewMotif className="absolute top-2 left-0 h-32 w-32 text-foreground/15 motion-safe:animate-[drift-diagonal_22s_ease-in-out_infinite] md:top-10 md:left-12 md:h-48 md:w-48" />
        <ProjectsMotif className="absolute top-8 right-0 h-32 w-32 text-foreground/15 motion-safe:animate-[drift-diagonal-reverse_26s_ease-in-out_infinite] md:top-14 md:right-14 md:h-52 md:w-52" />
        <InventoryMotif className="absolute bottom-8 left-0 h-32 w-32 text-foreground/15 motion-safe:animate-[drift-diagonal-reverse_30s_ease-in-out_infinite] md:bottom-14 md:left-16 md:h-48 md:w-48" />
        <AuditMotif className="absolute right-0 bottom-2 h-32 w-32 text-foreground/15 motion-safe:animate-[drift-diagonal_24s_ease-in-out_infinite] md:right-16 md:bottom-12 md:h-48 md:w-48" />
      </div>

      <section
        aria-labelledby="session-expired-title"
        className="relative w-full max-w-md rounded-2xl border bg-card p-8 text-center text-card-foreground shadow-sm"
      >
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-muted">
          <LockKeyhole className="size-7 text-muted-foreground" aria-hidden="true" />
        </div>

        <h1 id="session-expired-title" className="font-heading text-2xl font-medium">
          Tu sesión expiró
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">
          Por seguridad, tu sesión fue cerrada o revocada. Inicia sesión de nuevo
          para continuar.
        </p>

        <form action={signInWithGoogle} className="mt-6">
          <input type="hidden" name="redirectTo" value="/dashboard" />
          <Button type="submit" className="h-11 w-full text-base">
            <span>Iniciar sesión con</span>
            <GoogleIcon className="size-4" />
            <span>Google</span>
          </Button>
        </form>

        <p className="mt-4 text-xs text-muted-foreground">
          Si el problema continúa, contacta al administrador del sistema.
        </p>

        <div className="mt-6 border-t pt-4">
          <Link
            href="/"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
