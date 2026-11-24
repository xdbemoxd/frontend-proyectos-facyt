import { cn } from "@/lib/utils";
import {
  AuditMotif,
  DispatchMotif,
  EquipmentMotif,
  ExpensesMotif,
  InventoryMotif,
  LotsMotif,
  OverviewMotif,
  OverheadMotif,
  PriorityMotif,
  ProjectsMotif,
  ReportsMotif,
  ReservationsMotif,
  UsersMotif,
  VendorsMotif,
} from "./motifs";

export type SectionArtVariant =
  | "overview"
  | "projects"
  | "priority"
  | "inventory"
  | "dispatch"
  | "lots"
  | "vendors"
  | "equipment"
  | "reservations"
  | "expenses"
  | "overhead"
  | "users"
  | "audit"
  | "reports";

const MOTIFS = {
  overview: OverviewMotif,
  projects: ProjectsMotif,
  priority: PriorityMotif,
  inventory: InventoryMotif,
  dispatch: DispatchMotif,
  lots: LotsMotif,
  vendors: VendorsMotif,
  equipment: EquipmentMotif,
  reservations: ReservationsMotif,
  expenses: ExpensesMotif,
  overhead: OverheadMotif,
  users: UsersMotif,
  audit: AuditMotif,
  reports: ReportsMotif,
};

export function SectionArt({ variant, className }: { variant: SectionArtVariant; className?: string }) {
  const Motif = MOTIFS[variant];

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute -top-16 -right-16 hidden h-72 w-72 text-foreground/25 md:block",
        "[mask-image:radial-gradient(circle_at_top_right,black_40%,transparent_100%)]",
        "print:hidden",
        className,
      )}
    >
      <Motif />
    </div>
  );
}
