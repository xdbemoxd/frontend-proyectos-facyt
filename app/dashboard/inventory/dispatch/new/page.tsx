import { requireRole } from "@/components/auth/require-role";
import { PageHeader } from "@/components/layout/page-header";
import { DispatchForm } from "@/components/dispatch/dispatch-form";
import { ADMIN_OR_APPROVER } from "@/lib/auth/roles";

export const metadata = { title: "Nuevo despacho" };

export default async function NewDispatchPage() {
  await requireRole(ADMIN_OR_APPROVER);
  return (
    <main className="p-6">
      <PageHeader narrow title="Nuevo despacho"
        description="La fecha, la hora y el responsable se registran automáticamente."
        back={{ href: "/dashboard/inventory/dispatch", label: "Asignación de materias primas" }} />
      <DispatchForm />
    </main>
  );
}
