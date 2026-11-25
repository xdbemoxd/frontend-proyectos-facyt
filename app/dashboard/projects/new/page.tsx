import type { Metadata } from "next";
import { requireRole } from "@/components/auth/require-role";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectCreateForm } from "@/components/projects/project-create-form";
import { SectionArt } from "@/components/decor/section-art";
import { ADMIN_OR_COORDINATOR, normalizeRole } from "@/lib/auth/roles";

export const metadata: Metadata = { title: "Nuevo proyecto" };

export default async function NewProjectPage() {
  const session = await requireRole(ADMIN_OR_COORDINATOR);
  const isAdmin = normalizeRole(session.user.rol) === "admin_sistema";
  return (
    <main className="relative overflow-hidden p-6">
      <SectionArt variant="projects" />
      <PageHeader narrow title="Nuevo proyecto" description="Los campos con * son obligatorios."
        back={{ href: "/dashboard", label: "Dashboard" }} />
      <ProjectCreateForm isAdmin={isAdmin} />
    </main>
  );
}
