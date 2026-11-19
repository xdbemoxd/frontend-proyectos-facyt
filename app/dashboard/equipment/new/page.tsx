import { PageHeader } from "@/components/layout/page-header";
import { EquipmentForm } from "@/components/equipment/equipment-form";

export const metadata = { title: "Nuevo equipo" };

export default function NewEquipmentPage() {
  return (
    <main className="p-6">
      <PageHeader narrow title="Nuevo equipo" description="Los campos con * son obligatorios."
        back={{ href: "/dashboard/equipment", label: "Equipos" }} />
      <EquipmentForm />
    </main>
  );
}
