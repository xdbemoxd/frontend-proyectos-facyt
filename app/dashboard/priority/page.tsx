import { PageHeader } from "@/components/layout/page-header";
import { PriorityBoard } from "@/components/projects/priority-board";
import { SectionArt } from "@/components/decor/section-art";

export const metadata = { title: "Priorización de proyectos" };

export default function PriorityPage() {
  return (
    <main className="relative overflow-hidden p-6">
      <SectionArt variant="priority" />
      <PageHeader title="Priorización de proyectos"
        description="Proyectos ordenados por prioridad. Todo cambio requiere una justificación que queda en la bitácora." />
      <PriorityBoard />
    </main>
  );
}
