const STYLES = {
  ok: "bg-green-500/15 text-green-700 dark:text-green-400",
  redirect: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  client: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  server: "bg-red-500/15 text-red-700 dark:text-red-400",
} as const;

function tone(status: number) {
  if (status >= 500) return STYLES.server;
  if (status >= 400) return STYLES.client;
  if (status >= 300) return STYLES.redirect;
  return STYLES.ok;
}

export function HttpStatusBadge({ status }: { status: number | null }) {
  if (status == null) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 font-mono text-xs font-medium tabular-nums ${tone(status)}`}
      title={`HTTP ${status}`}
    >
      {status}
    </span>
  );
}
