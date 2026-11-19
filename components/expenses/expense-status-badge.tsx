import type { ExpenseStatusCode } from "@/lib/expenses/types";

const STYLES: Record<ExpenseStatusCode, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  approved: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  rejected: "bg-red-500/15 text-red-700 dark:text-red-400",
  executed: "bg-green-500/15 text-green-700 dark:text-green-400",
};

export function ExpenseStatusBadge({ code, name }: { code: ExpenseStatusCode; name: string }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${STYLES[code]}`}>
      {name}
    </span>
  );
}
