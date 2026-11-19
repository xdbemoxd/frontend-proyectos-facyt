import Link from "next/link";
import { Pencil } from "lucide-react";

/** Botón "Editar" para las filas de las tablas. */
export function EditLink({ href, label, disabled, disabledReason }: {
  href: string; label: string; disabled?: boolean; disabledReason?: string;
}) {
  const className = "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium";
  if (disabled) {
    return (
      <span className={`${className} cursor-not-allowed text-muted-foreground`} title={disabledReason}>
        <Pencil className="size-3.5" aria-hidden="true" />
        <span>Editar</span>
        <span className="sr-only">{label}: {disabledReason}</span>
      </span>
    );
  }
  return (
    <Link href={href} className={`${className} hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring`}>
      <Pencil className="size-3.5" aria-hidden="true" />
      <span>Editar</span>
      <span className="sr-only">{label}</span>
    </Link>
  );
}
