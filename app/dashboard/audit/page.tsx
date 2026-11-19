import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { AuditView } from "@/components/audit/audit-view";

export const metadata: Metadata = { title: "Auditoría" };

export default function AuditPage() {
  return (
    <main className="p-6">
      <PageHeader title="Auditoría"
        description="Trazabilidad de las acciones del sistema: quién, qué, cuándo y desde dónde." />
      <AuditView />
    </main>
  );
}
