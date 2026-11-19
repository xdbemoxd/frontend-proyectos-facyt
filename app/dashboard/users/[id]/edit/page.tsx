import { auth } from "@/auth";
import { PageHeader } from "@/components/layout/page-header";
import { UserEditForm } from "@/components/users/user-edit-form";

export const metadata = { title: "Editar usuario" };

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  return (
    <main className="p-6">
      <PageHeader narrow title="Editar usuario" description="Cambia el rol o desactiva la cuenta."
        back={{ href: "/dashboard/users", label: "Usuarios" }} />
      <UserEditForm id={id} currentUserEmail={session?.user?.email ?? null} />
    </main>
  );
}
