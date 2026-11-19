const STYLES: Record<string, string> = {
  Normal: "bg-green-500/15 text-green-700 dark:text-green-400",
  "Alerta Stock Mínimo": "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  Agotado: "bg-red-500/15 text-red-700 dark:text-red-400",
};

export function StockBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${STYLES[status] ?? "bg-muted"}`}>
      {status}
    </span>
  );
}
