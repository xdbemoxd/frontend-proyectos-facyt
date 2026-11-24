import type { Metadata } from "next";
import { requireRole } from "@/components/auth/require-role";
import { PageHeader } from "@/components/layout/page-header";
import { AuditView } from "@/components/audit/audit-view";
import { SectionArt } from "@/components/decor/section-art";
import { ADMIN_ONLY } from "@/lib/auth/roles";

export const metadata: Metadata = { title: "Auditoría" };

export default async function AuditPage() {
  await requireRole(ADMIN_ONLY);
  return (
    <main className="relative overflow-hidden p-6">
      <SectionArt variant="audit" />
      <PageHeader title="Auditoría"
        description="Trazabilidad de las acciones del sistema: quién, qué, cuándo y desde dónde." />
      <AuditView />
    </main>
  );
}
