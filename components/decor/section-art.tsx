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
        "pointer-events-none absolute -top-14 -right-14 hidden h-64 w-64 text-foreground/10 md:block",
        "[mask-image:radial-gradient(circle_at_top_right,black,transparent_72%)]",
        "print:hidden",
        className,
      )}
    >
      <Motif />
    </div>
  );
}
