import type { Metadata } from "next";
import { requireRole } from "@/components/auth/require-role";
import { PageHeader } from "@/components/layout/page-header";
import { UserCreateForm } from "@/components/users/user-create-form";
import { ADMIN_ONLY } from "@/lib/auth/roles";

export const metadata: Metadata = { title: "Nuevo usuario" };

export default async function NewUserPage() {
  await requireRole(ADMIN_ONLY);
  return (
    <main className="p-6">
      <PageHeader narrow title="Nuevo usuario" description="Solo correo y rol. Los campos con * son obligatorios."
        back={{ href: "/dashboard/users", label: "Usuarios" }} />
      <UserCreateForm />
    </main>
  );
}
