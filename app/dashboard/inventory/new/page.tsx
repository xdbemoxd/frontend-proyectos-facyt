import { requireRole } from "@/components/auth/require-role";
import { PageHeader } from "@/components/layout/page-header";
import { RawMaterialForm } from "@/components/inventory/raw-material-form";
import { ADMIN_OR_APPROVER } from "@/lib/auth/roles";

export const metadata = { title: "Nueva materia prima" };

export default async function NewRawMaterialPage() {
  await requireRole(ADMIN_OR_APPROVER);
  return (
    <main className="p-6">
      <PageHeader narrow title="Nueva materia prima" description="Los campos con * son obligatorios."
        back={{ href: "/dashboard/inventory", label: "Materias primas" }} />
      <RawMaterialForm />
    </main>
  );
}
