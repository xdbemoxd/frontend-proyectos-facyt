import type { Metadata } from "next";
import { auth } from "@/auth";
import { PageHeader } from "@/components/layout/page-header";
import { ReportsView } from "@/components/reports/reports-view";
import { SectionArt } from "@/components/decor/section-art";
import { ADMIN_OR_APPROVER, isRoleAllowed } from "@/lib/auth/roles";

export const metadata: Metadata = { title: "Reportes" };

export default async function ReportsPage() {
  const session = await auth();
  const canViewOverhead = isRoleAllowed(ADMIN_OR_APPROVER, session?.user?.rol);
  return (
    <main className="relative overflow-hidden p-6 print:p-0">
      <SectionArt variant="reports" />
      <div className="print:hidden">
        <PageHeader title="Reportes"
          description="Elige un reporte, revísalo y expórtalo a Excel o PDF." />
      </div>
      <ReportsView canViewOverhead={canViewOverhead} />
    </main>
  );
}
