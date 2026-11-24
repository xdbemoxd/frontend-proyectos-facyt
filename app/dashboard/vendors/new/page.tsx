import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireRole } from "@/components/auth/require-role";
import { VendorForm } from "@/components/vendors/vendor-form";
import { ADMIN_OR_APPROVER } from "@/lib/auth/roles";

export const metadata = { title: "Nuevo proveedor" };

export default async function NewVendorPage() {
  await requireRole(ADMIN_OR_APPROVER);
  return (
    <main className="p-6">
      <div className="mx-auto w-full max-w-xl">
        <Link href="/dashboard/vendors"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" aria-hidden="true" />
          Proveedores
        </Link>
        <h1 className="font-heading text-2xl font-medium">Nuevo proveedor</h1>
        <p className="mb-6 mt-1 text-sm text-muted-foreground">Los campos con * son obligatorios.</p>
      </div>
      <VendorForm />
    </main>
  );
}
