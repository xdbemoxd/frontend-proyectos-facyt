import { requireRole } from "@/components/auth/require-role";
import { PageHeader } from "@/components/layout/page-header";
import { ReservationForm } from "@/components/equipment/reservation-form";

export const metadata = { title: "Nueva reserva" };

export default async function NewReservationPage() {
  await requireRole();
  return (
    <main className="p-6">
      <PageHeader narrow title="Nueva reserva" description="Los campos con * son obligatorios."
        back={{ href: "/dashboard/equipment/reservations", label: "Reservas" }} />
      <ReservationForm />
    </main>
  );
}
