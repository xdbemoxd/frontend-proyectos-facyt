import type { UserState } from "@/lib/users/types";

const LABELS: Record<UserState, string> = {
  active: "Activo",
  inactive: "Inactivo",
  pending: "Pendiente de primer ingreso",
};
const STYLES: Record<UserState, string> = {
  active: "bg-green-500/15 text-green-700 dark:text-green-400",
  inactive: "bg-muted text-muted-foreground",
  pending: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
};

export function UserStateBadge({ state }: { state: UserState }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${STYLES[state]}`}>
      {LABELS[state]}
    </span>
  );
}
