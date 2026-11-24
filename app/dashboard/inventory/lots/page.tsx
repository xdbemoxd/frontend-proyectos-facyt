import { requireRole } from "@/components/auth/require-role";
import { PageHeader } from "@/components/layout/page-header";
import { LotsTable } from "@/components/lots/lots-table";
import { SectionArt } from "@/components/decor/section-art";
import { ADMIN_OR_APPROVER } from "@/lib/auth/roles";

export const metadata = { title: "Lotes de compra" };

export default async function LotsPage() {
  await requireRole(ADMIN_OR_APPROVER);
  return (
    <main className="relative overflow-hidden p-6">
      <SectionArt variant="lots" />
      <PageHeader title="Lotes de compra"
        description="Entradas de almacén: fecha de ingreso, costo unitario y proveedor. Cada lote suma al stock."
        action={{ href: "/dashboard/inventory/lots/new", label: "Registrar lote" }} />
      <LotsTable />
    </main>
  );
}
