import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { RawMaterialEditForm } from "@/components/inventory/raw-material-edit-form";

export const metadata: Metadata = { title: "Editar materia prima" };

export default async function EditRawMaterialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="p-6">
      <PageHeader narrow title="Editar materia prima" description="El stock no se edita: cambia con lotes y despachos."
        back={{ href: "/dashboard/inventory", label: "Inventario" }} />
      <RawMaterialEditForm id={id} />
    </main>
  );
}
