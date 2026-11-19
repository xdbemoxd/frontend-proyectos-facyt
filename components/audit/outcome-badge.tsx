import { OUTCOME_LABELS } from "@/lib/audit/labels";
import type { Outcome } from "@/lib/audit/types";

const STYLES: Record<Outcome, string> = {
  success: "bg-green-500/15 text-green-700 dark:text-green-400",
  denied: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  failed: "bg-red-500/15 text-red-700 dark:text-red-400",
};

export function OutcomeBadge({ outcome }: { outcome: Outcome }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${STYLES[outcome]}`}>
      {OUTCOME_LABELS[outcome]}
    </span>
  );
}
