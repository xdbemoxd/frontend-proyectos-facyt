import type { Metadata } from "next";
import { requireRole } from "@/components/auth/require-role";
import { PageHeader } from "@/components/layout/page-header";
import { EquipmentEditForm } from "@/components/equipment/equipment-edit-form";
import { ADMIN_OR_APPROVER } from "@/lib/auth/roles";

export const metadata: Metadata = { title: "Editar equipo" };

export default async function EditEquipmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole(ADMIN_OR_APPROVER);
  return (
    <main className="p-6">
      <PageHeader narrow title="Editar equipo" description="Los campos con * son obligatorios."
        back={{ href: "/dashboard/equipment", label: "Equipos" }} />
      <EquipmentEditForm id={id} />
    </main>
  );
}
