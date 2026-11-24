import { PageHeader } from "@/components/layout/page-header";
import { ExpensesBoard } from "@/components/expenses/expenses-board";
import { SectionArt } from "@/components/decor/section-art";

export const metadata = { title: "Solicitudes de gasto" };

export default function ExpensesPage() {
  return (
    <main className="relative overflow-hidden p-6">
      <SectionArt variant="expenses" />
      <PageHeader title="Solicitudes de gasto"
        description="Borrador → Pendiente de aprobación → Aprobado / Rechazado → Ejecutado."
        action={{ href: "/dashboard/expenses/new", label: "Nueva solicitud" }} />
      <ExpensesBoard />
    </main>
  );
}
