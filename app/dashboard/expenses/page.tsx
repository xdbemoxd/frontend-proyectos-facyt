import { requireRole } from "@/components/auth/require-role";
import { PageHeader } from "@/components/layout/page-header";
import { ExpensesBoard } from "@/components/expenses/expenses-board";
import { SectionArt } from "@/components/decor/section-art";
import { ADMIN_OR_APPROVER, ADMIN_OR_COORDINATOR, isRoleAllowed, normalizeRole } from "@/lib/auth/roles";

export const metadata = { title: "Solicitudes de gasto" };

export default async function ExpensesPage() {
  const session = await requireRole();
  const canCreate = isRoleAllowed(ADMIN_OR_COORDINATOR, session.user?.rol);
  const canReview = isRoleAllowed(ADMIN_OR_APPROVER, session.user?.rol);
  const isAdmin = normalizeRole(session.user?.rol) === "admin_sistema";

  return (
    <main className="relative overflow-hidden p-6">
      <SectionArt variant="expenses" />
      <PageHeader title="Solicitudes de gasto"
        description="Borrador → Pendiente de aprobación → Aprobado / Rechazado → Ejecutado."
        action={canCreate ? { href: "/dashboard/expenses/new", label: "Nueva solicitud" } : undefined} />
      <ExpensesBoard canReview={canReview} isAdmin={isAdmin} currentUserId={session.user.id} />
    </main>
  );
}
