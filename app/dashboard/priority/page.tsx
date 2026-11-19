import { PageHeader } from "@/components/layout/page-header";
import { PriorityBoard } from "@/components/projects/priority-board";

export const metadata = { title: "Priorización de proyectos" };

export default function PriorityPage() {
  return (
    <main className="p-6">
      <PageHeader title="Priorización de proyectos"
        description="Proyectos ordenados por prioridad. Todo cambio requiere una justificación que queda en la bitácora." />
      <PriorityBoard />
    </main>
  );
}
