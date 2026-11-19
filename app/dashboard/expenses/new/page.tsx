import { PageHeader } from "@/components/layout/page-header";
import { ExpenseForm } from "@/components/expenses/expense-form";

export const metadata = { title: "Nueva solicitud de gasto" };

export default function NewExpensePage() {
  return (
    <main className="p-6">
      <PageHeader narrow title="Nueva solicitud de gasto"
        description="Puedes guardarla como borrador o enviarla directo a aprobación."
        back={{ href: "/dashboard/expenses", label: "Solicitudes de gasto" }} />
      <ExpenseForm />
    </main>
  );
}
