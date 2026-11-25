import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/auth";
import { ProjectsTable } from "@/components/projects/projects-table";
import { DashboardKpis } from "@/components/dashboard/dashboard-kpis";
import { SectionArt } from "@/components/decor/section-art";
import { normalizeRole } from "@/lib/auth/roles";

export const metadata = { title: "Dashboard" };

/** Dashboard = KPIs + listado de proyectos. */
export default async function DashboardPage() {
  const session = await auth();
  const role = normalizeRole(session?.user?.rol);
  // El aprobador solo consulta: la edicion de datos generales es de admin y
  // coordinador (el backend tambien lo exige).
  const canEdit = role === "admin_sistema" || role === "coordinador";
  return (
    <main className="relative overflow-hidden p-6">
      <SectionArt variant="overview" />
      <h1 className="font-heading text-2xl font-medium">Hola, {session?.user?.name}</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">Resumen ejecutivo y proyectos.</p>

      <DashboardKpis />

      <section aria-labelledby="projects-title" className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="projects-title" className="font-heading text-lg font-medium">
            Proyectos
          </h2>
          {canEdit && (
            <Link href="/dashboard/projects/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-ring">
              <Plus className="size-4" aria-hidden="true" />
              Nuevo proyecto
            </Link>
          )}
        </div>
        <ProjectsTable canEdit={canEdit} />
      </section>
    </main>
  );
}
