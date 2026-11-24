"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useUsers } from "@/hooks/use-users";
import { useRoles } from "@/hooks/use-roles";
import { ROLE_LABELS } from "@/lib/users/mock";
import { userState } from "@/lib/users/types";
import { Button } from "@/components/ui/button";
import { UserStateBadge } from "./user-state-badge";

const dateFmt = new Intl.DateTimeFormat("es-VE", { dateStyle: "medium" });

const PAGE_SIZE = 8;

export function UsersTable() {
  const { roles } = useRoles();
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState(""); // query con debounce
  const [rol, setRol] = useState(""); // id del rol
  const [page, setPage] = useState(1);

  // Espera 300 ms tras dejar de escribir para no pedir al backend en cada tecla.
  useEffect(() => {
    const t = setTimeout(() => { setSearch(query.trim()); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data, error, isLoading, mutate } = useUsers({
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
    search,
    role_id: rol || undefined,
  });

  if (isLoading && !data) {
    return <p className="py-6 text-sm text-muted-foreground" aria-busy="true">Cargando usuarios…</p>;
  }
  if (error) {
    return (
      <div className="py-6 text-sm text-destructive" role="alert">
        {error.message}{" "}
        <Button variant="outline" size="sm" onClick={() => mutate()}>Reintentar</Button>
      </div>
    );
  }

  const q = search;
  const total = data?.total ?? 0;
  const pageRows = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * PAGE_SIZE;

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
          <select value={rol} onChange={(e) => { setRol(e.target.value); setPage(1); }}
            className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            <option value="">Todos los roles</option>
            {roles.map((r) => <option key={r.id} value={r.id}>{ROLE_LABELS[r.name] ?? r.name}</option>)}
          </select>
        </label>
      </div>

      {total === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          {q || rol ? "Ningún usuario coincide con el filtro." : "No hay usuarios registrados."}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
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
              {pageRows.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {u.name ? `${u.name} ${u.lastname ?? ""}` : <span className="text-muted-foreground">Sin nombre aún</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">{ROLE_LABELS[u.rol.name] ?? u.rol.name}</td>
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
              {/* Filas vacías para que la tabla mida siempre PAGE_SIZE filas */}
              {Array.from({ length: PAGE_SIZE - pageRows.length }, (_, k) => (
                <tr key={`empty-${k}`} aria-hidden="true" className="border-t">
                  <td colSpan={5} className="px-4 py-3">
                    <div className="h-9" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <nav aria-label="Paginación de usuarios"
            className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-muted-foreground" aria-live="polite">
              Mostrando {start + 1}–{start + pageRows.length} de {total}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(current - 1)} disabled={current === 1}>
                <ChevronLeft className="size-4" aria-hidden="true" />
                Anterior
              </Button>
              <span className="tabular-nums">Página {current} de {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(current + 1)} disabled={current === totalPages}>
                Siguiente
                <ChevronRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
