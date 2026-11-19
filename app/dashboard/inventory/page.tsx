import { PageHeader } from "@/components/layout/page-header";
import { StockTable } from "@/components/inventory/stock-table";

export const metadata = { title: "Materias primas" };

export default function InventoryPage() {
  return (
    <main className="p-6">
      <PageHeader title="Materias primas y consumibles"
        description="Stock por proveedor en tiempo real, con alertas de stock mínimo."
        action={{ href: "/dashboard/inventory/new", label: "Nueva materia prima" }} />
      <StockTable />
    </main>
  );
}
