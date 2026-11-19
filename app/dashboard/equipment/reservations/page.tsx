import { PageHeader } from "@/components/layout/page-header";
import { ReservationsTable } from "@/components/equipment/reservations-table";

export const metadata = { title: "Reservas de equipos" };

export default function ReservationsPage() {
  return (
    <main className="p-6">
      <PageHeader title="Reservas de equipos"
        description="Agenda de reservas por proyecto, sin choques de horario."
        action={{ href: "/dashboard/equipment/reservations/new", label: "Nueva reserva" }} />
      <ReservationsTable />
    </main>
  );
}
