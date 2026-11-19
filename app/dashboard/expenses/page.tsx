import { PageHeader } from "@/components/layout/page-header";
import { ExpensesBoard } from "@/components/expenses/expenses-board";

export const metadata = { title: "Solicitudes de gasto" };

export default function ExpensesPage() {
  return (
    <main className="p-6">
      <PageHeader title="Solicitudes de gasto"
        description="Borrador → Pendiente de aprobación → Aprobado / Rechazado → Ejecutado."
        action={{ href: "/dashboard/expenses/new", label: "Nueva solicitud" }} />
      <ExpensesBoard />
    </main>
  );
}
