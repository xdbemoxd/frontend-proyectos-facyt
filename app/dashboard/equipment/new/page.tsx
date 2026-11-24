import { requireRole } from "@/components/auth/require-role";
import { PageHeader } from "@/components/layout/page-header";
import { EquipmentForm } from "@/components/equipment/equipment-form";
import { ADMIN_OR_APPROVER } from "@/lib/auth/roles";

export const metadata = { title: "Nuevo equipo" };

export default async function NewEquipmentPage() {
  await requireRole(ADMIN_OR_APPROVER);
  return (
    <main className="p-6">
      <PageHeader narrow title="Nuevo equipo" description="Los campos con * son obligatorios."
        back={{ href: "/dashboard/equipment", label: "Equipos" }} />
      <EquipmentForm />
    </main>
  );
}
