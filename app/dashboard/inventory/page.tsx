import { requireRole } from "@/components/auth/require-role";
import { PageHeader } from "@/components/layout/page-header";
import { StockTable } from "@/components/inventory/stock-table";
import { SectionArt } from "@/components/decor/section-art";
import { isRoleAllowed, ADMIN_OR_APPROVER } from "@/lib/auth/roles";

export const metadata = { title: "Materias primas" };

export default async function InventoryPage() {
  const session = await requireRole();
  const canEdit = isRoleAllowed(ADMIN_OR_APPROVER, session.user?.rol);
  return (
    <main className="relative overflow-hidden p-6">
      <SectionArt variant="inventory" />
      <PageHeader title="Materias primas y consumibles"
        description="Stock por proveedor en tiempo real, con alertas de stock mínimo."
        action={canEdit ? { href: "/dashboard/inventory/new", label: "Nueva materia prima" } : undefined} />
      <StockTable canEdit={canEdit} />
    </main>
  );
}
