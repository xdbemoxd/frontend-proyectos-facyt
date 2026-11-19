"use client";

import { useEffect, useState } from "react";

/** Carga un registro por id. undefined = cargando, null = no existe. */
export function useRecord<T>(load: (id: string) => Promise<T | null>, id: string) {
  const [record, setRecord] = useState<T | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    load(id)
      .then((r) => { if (alive) setRecord(r); })
      .catch(() => { if (alive) setRecord(null); });
    return () => { alive = false; };
  }, [load, id]);
  return record;
}

/** Mensaje de "Cargando…" o "No encontrado" para los formularios de edición. */
export function RecordStatus({ loading, notFound }: { loading: boolean; notFound: string }) {
  if (loading) {
    return <p className="mx-auto max-w-xl text-sm text-muted-foreground" aria-busy="true">Cargando…</p>;
  }
  return (
    <p className="mx-auto max-w-xl rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
      {notFound}
    </p>
  );
}

/** Dato de solo lectura dentro de un formulario. */
export function ReadOnlyField({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <span className="rounded-lg border border-dashed bg-muted px-3 py-2 text-sm">{value}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}
