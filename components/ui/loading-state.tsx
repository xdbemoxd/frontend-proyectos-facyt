import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

type LoadingStateProps = {
  label: string;
  description?: string;
  rows?: number;
  compact?: boolean;
  className?: string;
};

export function LoadingState({ label, description, rows = 3, compact = false, className }: LoadingStateProps) {
  if (compact) {
    return (
      <div
        className={cn("flex items-center gap-3 py-6 text-sm text-muted-foreground", className)}
        aria-busy="true"
        aria-live="polite"
      >
        <Spinner className="size-5" label={label} />
        <span>{label}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed bg-card/60 p-10 text-center",
        className,
      )}
      aria-busy="true"
      aria-live="polite"
    >
      <Spinner className="size-12" label={label} />
      <div className="space-y-1">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {rows > 0 && (
        <div className="mt-2 w-full max-w-md space-y-2" aria-hidden="true">
          {Array.from({ length: rows }).map((_, index) => (
            <div
              key={index}
              className="h-9 animate-pulse rounded-lg bg-muted/70"
              style={{ animationDelay: `${index * 120}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
