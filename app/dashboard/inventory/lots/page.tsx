import { requireRole } from "@/components/auth/require-role";
import { PageHeader } from "@/components/layout/page-header";
import { LotsTable } from "@/components/lots/lots-table";
import { SectionArt } from "@/components/decor/section-art";
import { ADMIN_OR_APPROVER, isRoleAllowed } from "@/lib/auth/roles";

export const metadata = { title: "Lotes de compra" };

export default async function LotsPage() {
  const session = await requireRole();
  const canManage = isRoleAllowed(ADMIN_OR_APPROVER, session.user?.rol);
  return (
    <main className="relative overflow-hidden p-6">
      <SectionArt variant="lots" />
      <PageHeader title="Lotes de compra"
        description="Entradas de almacén: fecha de ingreso, costo unitario y proveedor. Cada lote suma al stock."
        action={canManage ? { href: "/dashboard/inventory/lots/new", label: "Registrar lote" } : undefined} />
      <LotsTable />
    </main>
  );
}
