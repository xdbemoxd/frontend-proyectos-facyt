import type { Metadata } from "next";
import { requireRole } from "@/components/auth/require-role";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectEditForm } from "@/components/projects/project-edit-form";
import { SectionArt } from "@/components/decor/section-art";
import { ADMIN_OR_COORDINATOR, normalizeRole } from "@/lib/auth/roles";

export const metadata: Metadata = { title: "Editar proyecto" };

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireRole(ADMIN_OR_COORDINATOR);
  const isAdmin = normalizeRole(session.user.rol) === "admin_sistema";
  return (
    <main className="relative overflow-hidden p-6">
      <SectionArt variant="projects" />
      <PageHeader narrow title="Editar proyecto" description="El código y la prioridad no se cambian aquí."
        back={{ href: "/dashboard", label: "Dashboard" }} />
      <ProjectEditForm id={id} canPrioritize={isAdmin} canEditStatus={isAdmin} />
    </main>
  );
}
