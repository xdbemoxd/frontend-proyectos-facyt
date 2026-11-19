import { ProjectsTable } from "@/components/projects/projects-table";

export const metadata = { title: "Proyectos" };

export default function Page() {
  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-medium">Proyectos</h1>
      <ProjectsTable />
    </main>
  );
}
