const STYLES: Record<string, string> = {
  Disponible: "bg-green-500/15 text-green-700 dark:text-green-400",
  "En uso": "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  "En mantenimiento": "bg-amber-500/15 text-amber-700 dark:text-amber-400",
};

export function EquipmentStatusBadge({ name }: { name: string }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STYLES[name] ?? "bg-muted text-muted-foreground"}`}>
      {name}
    </span>
  );
}
