import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectEditForm } from "@/components/projects/project-edit-form";

export const metadata: Metadata = { title: "Editar proyecto" };

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="p-6">
      <PageHeader narrow title="Editar proyecto" description="El código y la prioridad no se cambian aquí."
        back={{ href: "/dashboard", label: "Dashboard" }} />
      <ProjectEditForm id={id} />
    </main>
  );
}
