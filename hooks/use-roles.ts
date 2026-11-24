"use client";

import useSWR from "swr";
import { getRoles } from "@/services/roles.service";
import { roleLabel } from "@/lib/users/labels";
import type { Role, RoleOption } from "@/lib/roles/types";

export const ROLES_KEY = "roles";

/**
 * Roles con caché de SWR. El fetcher es una server action, así que la
 * petición a FastAPI (con el JWT) se hace en el servidor.
 */
export function useRoles() {
  const swr = useSWR<Role[], Error>(ROLES_KEY, () => getRoles(), {
    revalidateOnFocus: false, // los roles casi nunca cambian
    dedupingInterval: 5 * 60 * 1000,
  });

  const options: RoleOption[] = (swr.data ?? []).map((r) => ({
    value: r.id,
    label: `${roleLabel(r.name)}${r.description ? ` — ${r.description}` : ""}`,
  }));

  return { ...swr, roles: swr.data ?? [], options };
}
