import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { EquipmentEditForm } from "@/components/equipment/equipment-edit-form";

export const metadata: Metadata = { title: "Editar equipo" };

export default async function EditEquipmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="p-6">
      <PageHeader narrow title="Editar equipo" description="Los campos con * son obligatorios."
        back={{ href: "/dashboard/equipment", label: "Equipos" }} />
      <EquipmentEditForm id={id} />
    </main>
  );
}
