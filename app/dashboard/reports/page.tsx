import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ReportsView } from "@/components/reports/reports-view";
import { SectionArt } from "@/components/decor/section-art";

export const metadata: Metadata = { title: "Reportes" };

export default function ReportsPage() {
  return (
    <main className="relative overflow-hidden p-6 print:p-0">
      <SectionArt variant="reports" />
      <div className="print:hidden">
        <PageHeader title="Reportes"
          description="Elige un reporte, revísalo y expórtalo a Excel o PDF." />
      </div>
      <ReportsView />
    </main>
  );
}
