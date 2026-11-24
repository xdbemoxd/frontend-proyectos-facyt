import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Acceso no autorizado" };

type UnauthorizedPageProps = {
  searchParams: Promise<{ error?: string }>;
};

/**
 * Pagina de error de NextAuth (`pages.error` en auth.config.ts).
 * `AccessDenied` = FastAPI rechazo el login (correo no registrado o inactivo).
 */
export default async function UnauthorizedPage({ searchParams }: UnauthorizedPageProps) {
  const { error } = await searchParams;
  const isRoleDenied = error === "RoleNotAllowed";
  const isAccessDenied = !error || error === "AccessDenied";
  const title = isRoleDenied
    ? "Acceso no autorizado"
    : isAccessDenied
      ? "Error: correo no registrado"
      : "No pudimos iniciar sesión";
  const message = isRoleDenied
    ? "Tu rol no tiene permisos para acceder a esta sección. Si crees que es un error, contacta al administrador del sistema."
    : isAccessDenied
      ? "Comuníquese con el gestor del sistema para más información."
      : "Ocurrió un problema al iniciar sesión. Intente de nuevo en unos minutos.";

  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6">
      <section
        role="alert"
        aria-labelledby="unauthorized-title"
        className="w-full max-w-md rounded-xl border bg-card p-8 text-center text-card-foreground shadow-sm"
      >
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="size-7 text-destructive" aria-hidden="true" />
        </div>

        <h1 id="unauthorized-title" className="font-heading text-xl font-semibold">
          {title}
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {message}
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
          >
            <Button type="submit" className="w-full">
              Intentar con otro correo
            </Button>
          </form>

          <Link
            href="/"
            className="rounded-lg py-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-ring"
          >
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
