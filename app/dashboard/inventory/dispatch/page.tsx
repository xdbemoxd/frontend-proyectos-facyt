import { PageHeader } from "@/components/layout/page-header";
import { DispatchTable } from "@/components/dispatch/dispatch-table";
import { SectionArt } from "@/components/decor/section-art";

export const metadata = { title: "Asignación de materias primas" };

export default function DispatchPage() {
  return (
    <main className="relative overflow-hidden p-6">
      <SectionArt variant="dispatch" />
      <PageHeader title="Asignación de materias primas"
        description="Bitácora de salidas de almacén por proyecto. Cada despacho resta del stock."
        action={{ href: "/dashboard/inventory/dispatch/new", label: "Nuevo despacho" }} />
      <DispatchTable />
    </main>
  );
}
