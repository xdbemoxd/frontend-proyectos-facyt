import { PageHeader } from "@/components/layout/page-header";
import { StockTable } from "@/components/inventory/stock-table";
import { SectionArt } from "@/components/decor/section-art";

export const metadata = { title: "Materias primas" };

export default function InventoryPage() {
  return (
    <main className="relative overflow-hidden p-6">
      <SectionArt variant="inventory" />
      <PageHeader title="Materias primas y consumibles"
        description="Stock por proveedor en tiempo real, con alertas de stock mínimo."
        action={{ href: "/dashboard/inventory/new", label: "Nueva materia prima" }} />
      <StockTable />
    </main>
  );
}
