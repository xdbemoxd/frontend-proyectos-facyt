import type { Metadata } from "next";
import { requireRole } from "@/components/auth/require-role";
import { PageHeader } from "@/components/layout/page-header";
import { VendorEdit } from "@/components/vendors/vendor-edit";
import { ADMIN_OR_APPROVER } from "@/lib/auth/roles";

export const metadata: Metadata = { title: "Editar proveedor" };

export default async function EditVendorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole(ADMIN_OR_APPROVER);
  return (
    <main className="p-6">
      <PageHeader narrow title="Editar proveedor" description="Los campos con * son obligatorios."
        back={{ href: "/dashboard/vendors", label: "Proveedores" }} />
      <VendorEdit id={id} />
    </main>
  );
}
