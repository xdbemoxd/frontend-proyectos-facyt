import { requireRole } from "@/components/auth/require-role";
import { PageHeader } from "@/components/layout/page-header";
import { LotForm } from "@/components/lots/lot-form";
import { ADMIN_OR_APPROVER } from "@/lib/auth/roles";

export const metadata = { title: "Registrar lote" };

export default async function NewLotPage() {
  await requireRole(ADMIN_OR_APPROVER);
  return (
    <main className="p-6">
      <PageHeader narrow title="Registrar lote de compra"
        description="Los lotes no se pueden editar ni borrar después de guardarlos."
        back={{ href: "/dashboard/inventory/lots", label: "Lotes de compra" }} />
      <LotForm />
    </main>
  );
}
