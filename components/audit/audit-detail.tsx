import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { actionLabel, entityLabel, fieldLabel } from "@/lib/audit/labels";
import { diffAudit, formatValue } from "@/lib/audit/diff";
import type { AuditEntry } from "@/lib/audit/types";
import { OutcomeBadge } from "./outcome-badge";

const dateTimeFmt = new Intl.DateTimeFormat("es-VE", { dateStyle: "long", timeStyle: "medium" });

/** Panel lateral con el detalle de un registro y lo que cambio. */
export function AuditDetail({ entry, onClose }: { entry: AuditEntry; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const diff = diffAudit(entry.before_str, entry.after_str);
  const hasData = entry.before_str !== null || entry.after_str !== null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" aria-label="Cerrar detalle" onClick={onClose}
        className="absolute inset-0 bg-black/40" tabIndex={-1} />
      <aside role="dialog" aria-modal="true" aria-labelledby="audit-detail-title"
        className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l bg-background p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="audit-detail-title" className="font-heading text-lg font-medium">
              {actionLabel(entry.action)} · {entityLabel(entry.entity)}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{dateTimeFmt.format(new Date(entry.timestamp))}</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose}
            className="rounded-lg p-2 hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring">
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Cerrar</span>
          </button>
        </div>

        <dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Resultado</dt>
          <dd><OutcomeBadge outcome={entry.outcome} /></dd>
          <dt className="text-muted-foreground">Usuario</dt>
          <dd>
            {entry.user ? (
              <>{entry.user.full_name}<span className="block text-xs text-muted-foreground">{entry.user.email}</span></>
            ) : (
              <span className="text-muted-foreground">Usuario eliminado o no autenticado</span>
            )}
          </dd>
          <dt className="text-muted-foreground">Registro</dt>
          <dd>{entry.entity_label ?? <span className="text-muted-foreground">—</span>}</dd>
          <dt className="text-muted-foreground">ID</dt>
          <dd className="break-all font-mono text-xs">{entry.entity_id ?? "—"}</dd>
        </dl>

        <section aria-labelledby="http-title" className="mt-6">
          <h3 id="http-title" className="mb-2 text-sm font-medium">Petición HTTP</h3>
          <dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Método</dt>
            <dd className="font-mono text-xs">{entry.method ?? "—"}</dd>
            <dt className="text-muted-foreground">Endpoint</dt>
            <dd className="break-all font-mono text-xs">{entry.path ?? "—"}</dd>
            <dt className="text-muted-foreground">Código HTTP</dt>
            <dd className="font-mono text-xs">{entry.status_code ?? "—"}</dd>
            <dt className="text-muted-foreground">Duración</dt>
            <dd>{entry.duration_ms != null ? `${entry.duration_ms} ms` : "—"}</dd>
            <dt className="text-muted-foreground">IP</dt>
            <dd className="break-all font-mono text-xs">{entry.ip_address}</dd>
            <dt className="text-muted-foreground">Request ID</dt>
            <dd className="break-all font-mono text-xs">{entry.request_id ?? "—"}</dd>
            <dt className="text-muted-foreground">User-Agent</dt>
            <dd className="break-all text-xs">{entry.user_agent ?? "—"}</dd>
            {entry.error_code && (
              <>
                <dt className="text-muted-foreground">Error</dt>
                <dd className="break-all text-xs">{entry.error_code}</dd>
              </>
            )}
            {entry.error_detail && (
              <>
                <dt className="text-muted-foreground">Detalle</dt>
                <dd className="break-all text-xs">{entry.error_detail}</dd>
              </>
            )}
          </dl>

          {entry.query_params && Object.keys(entry.query_params).length > 0 && (
            <details className="mt-3 text-xs">
              <summary className="cursor-pointer text-muted-foreground">Query params</summary>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3">
                {JSON.stringify(entry.query_params, null, 2)}
              </pre>
            </details>
          )}
          {entry.request_headers && Object.keys(entry.request_headers).length > 0 && (
            <details className="mt-3 text-xs">
              <summary className="cursor-pointer text-muted-foreground">Headers (redactados)</summary>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3">
                {JSON.stringify(entry.request_headers, null, 2)}
              </pre>
            </details>
          )}
        </section>

        <section aria-labelledby="changes-title" className="mt-6">
          <h3 id="changes-title" className="mb-2 text-sm font-medium">Qué cambió</h3>
          {!hasData ? (
            <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
              {entry.outcome === "denied" ? "La acción fue rechazada antes de modificar datos." : "Sin datos de cambios."}
            </p>
          ) : diff.raw ? (
            <div className="flex flex-col gap-2 text-xs">
              <pre className="whitespace-pre-wrap rounded-lg bg-muted p-3">Antes: {diff.raw.before ?? "—"}</pre>
              <pre className="whitespace-pre-wrap rounded-lg bg-muted p-3">Después: {diff.raw.after ?? "—"}</pre>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-xs uppercase text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-3 py-2">Campo</th>
                    <th scope="col" className="px-3 py-2">Antes</th>
                    <th scope="col" className="px-3 py-2">Después</th>
                  </tr>
                </thead>
                <tbody>
                  {diff.changes.filter((c) => c.changed).map((c) => (
                    <tr key={c.field} className="border-t align-top">
                      <td className="px-3 py-2">{fieldLabel(c.field)}</td>
                      <td className="px-3 py-2 text-muted-foreground line-through decoration-muted-foreground/50">
                        {formatValue(c.before)}
                      </td>
                      <td className="px-3 py-2 font-medium">{formatValue(c.after)}</td>
                    </tr>
                  ))}
                  {diff.changes.every((c) => !c.changed) && (
                    <tr><td colSpan={3} className="px-3 py-2 text-muted-foreground">Ningún campo cambió.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </aside>
    </div>
  );
}
