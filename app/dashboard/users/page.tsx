import { PageHeader } from "@/components/layout/page-header";
import { UsersTable } from "@/components/users/users-table";
import { SectionArt } from "@/components/decor/section-art";

export const metadata = { title: "Usuarios" };

export default function UsersPage() {
  return (
    <main className="relative overflow-hidden p-6">
      <SectionArt variant="users" />
      <PageHeader title="Usuarios"
        description="Correos autorizados para iniciar sesión con Google y su rol en el sistema."
        action={{ href: "/dashboard/users/new", label: "Nuevo usuario" }} />
      <UsersTable />
    </main>
  );
}
