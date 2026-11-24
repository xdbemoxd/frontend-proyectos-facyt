import { PageHeader } from "@/components/layout/page-header";
import { PeriodsList } from "@/components/overhead/periods-list";
import { SectionArt } from "@/components/decor/section-art";

export const metadata = { title: "Prorrateo de consumibles" };

export default function OverheadPage() {
  return (
    <main className="relative overflow-hidden p-6">
      <SectionArt variant="overhead" />
      <PageHeader title="Prorrateo de consumibles"
        description="Reparto del costo de los consumibles compartidos entre los proyectos activos de cada período."
        action={{ href: "/dashboard/overhead/new", label: "Cerrar período" }} />
      <PeriodsList />
    </main>
  );
}
