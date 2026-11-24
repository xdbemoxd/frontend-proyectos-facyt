import { cn } from "@/lib/utils";

type SpinnerProps = {
  className?: string;
  label?: string;
};

/** Spinner circular reutilizable, con anillo y punto central. */
export function Spinner({ className, label = "Cargando" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "relative inline-flex size-10 shrink-0 items-center justify-center",
        className,
      )}
    >
      <span className="absolute inset-0 rounded-full border-[3px] border-muted" />
      <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-primary border-r-primary/40" />
      <span className="size-1.5 animate-pulse rounded-full bg-primary/70" />
    </span>
  );
}
