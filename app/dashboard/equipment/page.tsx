import { PageHeader } from "@/components/layout/page-header";
import { EquipmentTable } from "@/components/equipment/equipment-table";
import { SectionArt } from "@/components/decor/section-art";

export const metadata = { title: "Equipos" };

export default function EquipmentPage() {
  return (
    <main className="relative overflow-hidden p-6">
      <SectionArt variant="equipment" />
      <PageHeader title="Equipos y maquinaria"
        description="Catálogo de activos y su estado: Disponible, En uso o En mantenimiento."
        action={{ href: "/dashboard/equipment/new", label: "Nuevo equipo" }} />
      <EquipmentTable />
    </main>
  );
}
