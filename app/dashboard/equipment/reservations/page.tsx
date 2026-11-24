import { requireRole } from "@/components/auth/require-role";
import { PageHeader } from "@/components/layout/page-header";
import { ReservationsTable } from "@/components/equipment/reservations-table";
import { SectionArt } from "@/components/decor/section-art";

export const metadata = { title: "Reservas de equipos" };

export default async function ReservationsPage() {
  await requireRole();
  return (
    <main className="relative overflow-hidden p-6">
      <SectionArt variant="reservations" />
      <PageHeader title="Reservas de equipos"
        description="Agenda de reservas por proyecto, sin choques de horario."
        action={{ href: "/dashboard/equipment/reservations/new", label: "Nueva reserva" }} />
      <ReservationsTable />
    </main>
  );
}
