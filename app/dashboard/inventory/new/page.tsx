import { PageHeader } from "@/components/layout/page-header";
import { RawMaterialForm } from "@/components/inventory/raw-material-form";

export const metadata = { title: "Nueva materia prima" };

export default function NewRawMaterialPage() {
  return (
    <main className="p-6">
      <PageHeader narrow title="Nueva materia prima" description="Los campos con * son obligatorios."
        back={{ href: "/dashboard/inventory", label: "Materias primas" }} />
      <RawMaterialForm />
    </main>
  );
}
