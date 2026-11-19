import { cn } from "@/lib/utils";

const controlClass =
  "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive";

type BaseProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
};

function Wrapper({ id, label, error, hint, required, className, children }: BaseProps & { children: React.ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label} {required && <span className="text-destructive" aria-hidden="true">*</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: string) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

export function InputField(props: BaseProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const { id, label, error, hint, required, className, ...rest } = props;
  return (
    <Wrapper {...{ id, label, error, hint, required, className }}>
      <input id={id} required={required} aria-invalid={!!error}
        aria-describedby={describedBy(id, error, hint)} className={controlClass} {...rest} />
    </Wrapper>
  );
}

export function TextareaField(props: BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { id, label, error, hint, required, className, ...rest } = props;
  return (
    <Wrapper {...{ id, label, error, hint, required, className }}>
      <textarea id={id} rows={3} required={required} aria-invalid={!!error}
        aria-describedby={describedBy(id, error, hint)} className={controlClass} {...rest} />
    </Wrapper>
  );
}

type Option = { value: string | number; label: string; disabled?: boolean };

export function SelectField(
  props: BaseProps & React.SelectHTMLAttributes<HTMLSelectElement> & { options: Option[]; placeholder?: string },
) {
  const { id, label, error, hint, required, className, options, placeholder, ...rest } = props;
  return (
    <Wrapper {...{ id, label, error, hint, required, className }}>
      <select id={id} required={required} aria-invalid={!!error}
        aria-describedby={describedBy(id, error, hint)} className={controlClass} {...rest}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
        ))}
      </select>
    </Wrapper>
  );
}

/** Convierte los issues de zod a { campo: mensaje }. */
export function zodFieldErrors<T extends string>(issues: { path: PropertyKey[]; message: string }[]) {
  const errors: Partial<Record<T, string>> = {};
  for (const issue of issues) {
    const key = issue.path[0] as T;
    errors[key] ??= issue.message;
  }
  return errors;
}
