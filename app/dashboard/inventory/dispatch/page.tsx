import { requireRole } from "@/components/auth/require-role";
import { PageHeader } from "@/components/layout/page-header";
import { DispatchTable } from "@/components/dispatch/dispatch-table";
import { SectionArt } from "@/components/decor/section-art";
import { ADMIN_OR_APPROVER, isRoleAllowed } from "@/lib/auth/roles";

export const metadata = { title: "Asignación de materias primas" };

export default async function DispatchPage() {
  const session = await requireRole();
  // El coordinador solicita el retiro vía gastos; el despacho lo registra el
  // aprobador/gestor de inventario. La UI refleja esa decisión.
  const canManage = isRoleAllowed(ADMIN_OR_APPROVER, session.user?.rol);
  return (
    <main className="relative overflow-hidden p-6">
      <SectionArt variant="dispatch" />
      <PageHeader title="Asignación de materias primas"
        description="Bitácora de salidas de almacén por proyecto. Cada despacho resta del stock."
        action={canManage ? { href: "/dashboard/inventory/dispatch/new", label: "Nuevo despacho" } : undefined} />
      <DispatchTable />
    </main>
  );
}
