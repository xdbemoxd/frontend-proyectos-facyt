import { auth } from "@/auth";
import { ProjectsTable } from "@/components/projects/projects-table";
import { DashboardKpis } from "@/components/dashboard/dashboard-kpis";

export const metadata = { title: "Dashboard" };

/** Dashboard = KPIs + listado de proyectos. */
export default async function DashboardPage() {
  const session = await auth();
  return (
    <main className="p-6">
      <h1 className="font-heading text-2xl font-medium">Hola, {session?.user?.name}</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">Resumen ejecutivo y proyectos.</p>

      <DashboardKpis />

      <section aria-labelledby="projects-title" className="mt-8">
        <h2 id="projects-title" className="mb-4 font-heading text-lg font-medium">
          Proyectos
        </h2>
        <ProjectsTable />
      </section>
    </main>
  );
}
