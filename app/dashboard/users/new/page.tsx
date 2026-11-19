import { PageHeader } from "@/components/layout/page-header";
import { UserCreateForm } from "@/components/users/user-create-form";

export const metadata = { title: "Nuevo usuario" };

export default function NewUserPage() {
  return (
    <main className="p-6">
      <PageHeader narrow title="Nuevo usuario" description="Los campos con * son obligatorios."
        back={{ href: "/dashboard/users", label: "Usuarios" }} />
      <UserCreateForm />
    </main>
  );
}
