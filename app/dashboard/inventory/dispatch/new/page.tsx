import { PageHeader } from "@/components/layout/page-header";
import { DispatchForm } from "@/components/dispatch/dispatch-form";

export const metadata = { title: "Nuevo despacho" };

export default function NewDispatchPage() {
  return (
    <main className="p-6">
      <PageHeader narrow title="Nuevo despacho"
        description="La fecha, la hora y el responsable se registran automáticamente."
        back={{ href: "/dashboard/inventory/dispatch", label: "Asignación de materias primas" }} />
      <DispatchForm />
    </main>
  );
}
