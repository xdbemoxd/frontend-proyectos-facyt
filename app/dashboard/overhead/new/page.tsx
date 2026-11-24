import { requireRole } from "@/components/auth/require-role";
import { PageHeader } from "@/components/layout/page-header";
import { ClosePeriodForm } from "@/components/overhead/close-period-form";
import { ADMIN_OR_APPROVER } from "@/lib/auth/roles";

export const metadata = { title: "Cerrar período" };

export default async function ClosePeriodPage() {
  await requireRole(ADMIN_OR_APPROVER);
  return (
    <main className="p-6">
      <div className="mx-auto w-full max-w-2xl">
        <PageHeader title="Cerrar período contable"
          description="Revisa la vista previa antes de cerrar: el reparto no se puede modificar después."
          back={{ href: "/dashboard/overhead", label: "Prorrateo" }} />
      </div>
      <ClosePeriodForm />
    </main>
  );
}
