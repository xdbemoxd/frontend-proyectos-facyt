import { requireRole } from "@/components/auth/require-role";
import { PageHeader } from "@/components/layout/page-header";
import { EquipmentTable } from "@/components/equipment/equipment-table";
import { SectionArt } from "@/components/decor/section-art";
import { ADMIN_OR_APPROVER, isRoleAllowed } from "@/lib/auth/roles";

export const metadata = { title: "Equipos" };

export default async function EquipmentPage() {
  const session = await requireRole();
  const canManage = isRoleAllowed(ADMIN_OR_APPROVER, session.user?.rol);
  return (
    <main className="relative overflow-hidden p-6">
      <SectionArt variant="equipment" />
      <PageHeader title="Equipos y maquinaria"
        description="Catálogo de activos y su estado: Disponible, En uso o En mantenimiento."
        action={canManage ? { href: "/dashboard/equipment/new", label: "Nuevo equipo" } : undefined} />
      <EquipmentTable canManage={canManage} />
    </main>
  );
}
