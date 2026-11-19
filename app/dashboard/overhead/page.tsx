import { PageHeader } from "@/components/layout/page-header";
import { PeriodsList } from "@/components/overhead/periods-list";

export const metadata = { title: "Prorrateo de consumibles" };

export default function OverheadPage() {
  return (
    <main className="p-6">
      <PageHeader title="Prorrateo de consumibles"
        description="Reparto del costo de los consumibles compartidos entre los proyectos activos de cada período."
        action={{ href: "/dashboard/overhead/new", label: "Cerrar período" }} />
      <PeriodsList />
    </main>
  );
}
