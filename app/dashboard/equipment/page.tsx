import { PageHeader } from "@/components/layout/page-header";
import { EquipmentTable } from "@/components/equipment/equipment-table";

export const metadata = { title: "Equipos" };

export default function EquipmentPage() {
  return (
    <main className="p-6">
      <PageHeader title="Equipos y maquinaria"
        description="Catálogo de activos y su estado: Disponible, En uso o En mantenimiento."
        action={{ href: "/dashboard/equipment/new", label: "Nuevo equipo" }} />
      <EquipmentTable />
    </main>
  );
}
