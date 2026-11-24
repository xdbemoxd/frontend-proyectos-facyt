import { PageHeader } from "@/components/layout/page-header";
import { LotsTable } from "@/components/lots/lots-table";
import { SectionArt } from "@/components/decor/section-art";

export const metadata = { title: "Lotes de compra" };

export default function LotsPage() {
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
