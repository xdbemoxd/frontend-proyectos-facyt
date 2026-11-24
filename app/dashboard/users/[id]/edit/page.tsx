import type { Metadata } from "next";
import { requireRole } from "@/components/auth/require-role";
import { PageHeader } from "@/components/layout/page-header";
import { UserEditForm } from "@/components/users/user-edit-form";
import { ADMIN_ONLY } from "@/lib/auth/roles";

export const metadata: Metadata = { title: "Editar usuario" };

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireRole(ADMIN_ONLY);
  return (
    <main className="p-6">
      <PageHeader narrow title="Editar usuario" description="Cambia el rol o desactiva la cuenta."
        back={{ href: "/dashboard/users", label: "Usuarios" }} />
      <UserEditForm id={id} currentUserEmail={session?.user?.email ?? null} />
    </main>
  );
}
