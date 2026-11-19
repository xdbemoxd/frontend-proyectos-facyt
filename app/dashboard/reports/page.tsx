import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ReportsView } from "@/components/reports/reports-view";

export const metadata: Metadata = { title: "Reportes" };

export default function ReportsPage() {
  return (
    <main className="p-6 print:p-0">
      <div className="print:hidden">
        <PageHeader title="Reportes"
          description="Elige un reporte, revísalo y expórtalo a Excel o PDF." />
      </div>
      <ReportsView />
    </main>
  );
}
