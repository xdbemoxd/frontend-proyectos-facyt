"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useVendors } from "@/lib/vendors/use-vendors";
import { Button } from "@/components/ui/button";
import { EditLink } from "@/components/forms/edit-link";

const dateFmt = new Intl.DateTimeFormat("es-VE", { dateStyle: "medium" });

export function VendorsTable() {
  const { data, error, isLoading, mutate } = useVendors();
  const [query, setQuery] = useState("");

  if (isLoading && !data) {
    return <p className="py-6 text-sm text-muted-foreground" aria-busy="true">Cargando proveedores…</p>;
  }

  if (error) {
    return (
      <div className="py-6 text-sm text-destructive" role="alert">
        No se pudieron cargar los proveedores.{" "}
        <Button variant="outline" size="sm" onClick={() => mutate()}>Reintentar</Button>
      </div>
    );
  }

  const q = query.trim().toLowerCase();
  const rows = (data ?? []).filter(
    (v) =>
      !q ||
      v.name.toLowerCase().includes(q) ||
      (v.contact_email ?? "").toLowerCase().includes(q),
  );

  return (
    <div className="flex flex-col gap-4">
      <label className="relative block max-w-sm">
        <span className="sr-only">Buscar proveedor</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o correo"
          className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </label>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          {q ? "Ningún proveedor coincide con la búsqueda." : "No hay proveedores registrados."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Listado de proveedores</caption>
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3">Proveedor</th>
                <th scope="col" className="px-4 py-3">Correo</th>
                <th scope="col" className="px-4 py-3">Teléfono</th>
                <th scope="col" className="px-4 py-3">Registrado</th>
                <th scope="col" className="px-4 py-3">Actualizado</th>
                <th scope="col" className="px-4 py-3"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((v) => (
                <tr key={v.id} className="border-t align-top">
                  <td className="px-4 py-3">
                    <div className="font-medium">{v.name}</div>
                    <div className="text-xs text-muted-foreground">{v.description ?? "Sin descripción"}</div>
                  </td>
                  <td className="px-4 py-3">
                    {v.contact_email ? (
                      <a href={`mailto:${v.contact_email}`} className="underline-offset-4 hover:underline">
                        {v.contact_email}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{v.contact_phone ?? <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap">{dateFmt.format(new Date(v.create_at))}</td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap">{dateFmt.format(new Date(v.updated_at))}</td>
                  <td className="px-4 py-3 text-right">
                    <EditLink href={`/dashboard/vendors/${v.id}/edit`} label={v.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
