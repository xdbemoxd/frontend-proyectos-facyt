import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";

type PageHeaderProps = {
  title: string;
  description?: string;
  /** Boton "+ Nuevo" a la derecha. */
  action?: { href: string; label: string };
  /** Enlace "← Volver" arriba del titulo. */
  back?: { href: string; label: string };
  /** Centra el encabezado con el mismo ancho que los formularios. */
  narrow?: boolean;
};

export function PageHeader({ title, description, action, back, narrow }: PageHeaderProps) {
  return (
    <div className={narrow ? "mx-auto mb-6 w-full max-w-xl" : "mb-6"}>
      {back && (
        <Link href={back.href} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" aria-hidden="true" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-medium">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {action && (
          <Link href={action.href}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80 focus-visible:outline-2 focus-visible:outline-ring">
            <Plus className="size-4" aria-hidden="true" />
            {action.label}
          </Link>
        )}
      </div>
    </div>
  );
}
