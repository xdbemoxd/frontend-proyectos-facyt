import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { Boxes, CalendarClock, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Inicio" };

const MODULES = [
  {
    icon: FolderKanban,
    title: "Proyectos",
    description: "Registro, prioridades, avance y ejecución presupuestaria de los proyectos de la facultad.",
  },
  {
    icon: Boxes,
    title: "Inventario",
    description: "Materias primas, lotes, proveedores y despachos con control de existencias y mínimos.",
  },
  {
    icon: CalendarClock,
    title: "Equipos y reservas",
    description: "Disponibilidad de equipos de laboratorio y reservas sin solapamiento de horarios.",
  },
];

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="relative flex-1 overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklch,var(--primary),transparent_92%),transparent)]"
      />

      <div className="relative mx-auto flex max-w-5xl flex-col gap-16 px-6 py-16 sm:py-24">
        <section className="flex flex-col items-center text-center">
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Control de proyectos y recursos
          </h1>

          <p className="mt-4 max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">
            Gestión de proyectos científicos, inventario, equipos, solicitudes de gasto y auditoría
            en un solo lugar.
          </p>

          <form
            className="mt-8"
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <Button type="submit" className="h-11 px-6 text-base">
              Iniciar sesión con Google
            </Button>
          </form>

          <p className="mt-3 text-xs text-muted-foreground">
            Acceso restringido al personal autorizado.
          </p>
        </section>

        <section aria-label="Módulos del sistema" className="grid gap-4 sm:grid-cols-3">
          {MODULES.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-xl border bg-card p-5 text-card-foreground">
              <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
              <h2 className="mt-3 font-medium">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
