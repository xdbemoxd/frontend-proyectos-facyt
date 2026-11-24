import Link from "next/link";
import { Plus } from "lucide-react";
import { VendorsTable } from "@/components/vendors/vendors-table";
import { SectionArt } from "@/components/decor/section-art";

export const metadata = { title: "Proveedores" };

export default function VendorsPage() {
  return (
    <main className="relative overflow-hidden p-6">
      <SectionArt variant="vendors" />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-medium">Proveedores</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Proveedores de materia prima, consumibles y equipos.
          </p>
        </div>
        <Link
          href="/dashboard/vendors/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80 focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Plus className="size-4" aria-hidden="true" />
          Nuevo proveedor
        </Link>
      </div>
      <VendorsTable />
    </main>
  );
}
