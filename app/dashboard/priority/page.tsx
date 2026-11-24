import { requireRole } from "@/components/auth/require-role";
import { PageHeader } from "@/components/layout/page-header";
import { PriorityBoard } from "@/components/projects/priority-board";
import { SectionArt } from "@/components/decor/section-art";
import { ADMIN_OR_APPROVER } from "@/lib/auth/roles";

export const metadata = { title: "Priorización de proyectos" };

export default async function PriorityPage() {
  await requireRole(ADMIN_OR_APPROVER);
  return (
    <main className="relative overflow-hidden p-6">
      <SectionArt variant="priority" />
      <PageHeader title="Priorización de proyectos"
        description="Proyectos ordenados por prioridad. Todo cambio requiere una justificación que queda en la bitácora." />
      <PriorityBoard />
    </main>
  );
}
