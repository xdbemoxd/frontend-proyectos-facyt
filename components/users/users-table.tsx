"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useUsers } from "@/lib/users/use-users";
import { useRoles } from "@/lib/users/use-roles";
import { roleLabel } from "@/lib/users/labels";
import { userState } from "@/lib/users/types";
import { Button } from "@/components/ui/button";
import { UserStateBadge } from "./user-state-badge";

const dateFmt = new Intl.DateTimeFormat("es-VE", { dateStyle: "medium" });

export function UsersTable() {
  const { data, error, isLoading, mutate } = useUsers();
  const { roles } = useRoles();
  const [query, setQuery] = useState("");
  const [rol, setRol] = useState("");

  if (isLoading && !data) {
    return <p className="py-6 text-sm text-muted-foreground" aria-busy="true">Cargando usuarios…</p>;
  }
  if (error) {
    return (
      <div className="py-6 text-sm text-destructive" role="alert">
        No se pudieron cargar los usuarios.{" "}
        <Button variant="outline" size="sm" onClick={() => mutate()}>Reintentar</Button>
      </div>
    );
  }

  const q = query.trim().toLowerCase();
  const rows = (data ?? []).filter((u) => {
    const fullName = `${u.name ?? ""} ${u.lastname ?? ""}`.toLowerCase();
    return (!rol || u.rol.name === rol) && (!q || u.email.includes(q) || fullName.includes(q));
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <label className="relative block min-w-60 flex-1 sm:max-w-sm">
          <span className="sr-only">Buscar usuario</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o correo"
            className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50" />
        </label>
        <label>
          <span className="sr-only">Filtrar por rol</span>
          <select value={rol} onChange={(e) => setRol(e.target.value)}
            className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            <option value="">Todos los roles</option>
            {roles.map((r) => <option key={r.id} value={r.name}>{roleLabel(r.name)}</option>)}
          </select>
        </label>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          {q || rol ? "Ningún usuario coincide con el filtro." : "No hay usuarios registrados."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Usuarios del sistema</caption>
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3">Usuario</th>
                <th scope="col" className="px-4 py-3">Rol</th>
                <th scope="col" className="px-4 py-3">Estado</th>
                <th scope="col" className="px-4 py-3">Registrado</th>
                <th scope="col" className="px-4 py-3"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {u.name ? `${u.name} ${u.lastname ?? ""}` : <span className="text-muted-foreground">Sin nombre aún</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">{roleLabel(u.rol.name)}</td>
                  <td className="px-4 py-3"><UserStateBadge state={userState(u)} /></td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap">{dateFmt.format(new Date(u.create_at))}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/dashboard/users/${u.id}/edit`}
                      className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                      Editar
                    </Link>
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
