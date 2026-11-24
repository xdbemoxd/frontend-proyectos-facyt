"use client";

import useSWR, { mutate } from "swr";
import { getUserById, getUsers, type UsersPage, type UsersQuery } from "@/services/users.service";
import { handleSessionExpired } from "@/lib/session";
import type { AppUser } from "@/lib/users/types";

export const USERS_KEY = "users";

function handleAuthError(error: Error) {
  if (error.message.includes("sesión expiró") || error.message.includes("No autenticado")) {
    handleSessionExpired();
  }
}

/** Una página de usuarios (paginación en el backend). */
export function useUsers(query: UsersQuery) {
  return useSWR<UsersPage, Error>(
    [USERS_KEY, query.limit, query.offset, query.search ?? "", query.role_id ?? "", query.is_active ?? ""],
    () => getUsers(query),
    {
      keepPreviousData: true, // no parpadea al cambiar de página
      onError: handleAuthError,
    },
  );
}

/** Refresca todas las páginas de usuarios en caché (tras crear o editar). */
export function revalidateUsers() {
  return mutate((key) => Array.isArray(key) && key[0] === USERS_KEY);
}

/** Un usuario por id. data === null si no existe. */
export function useUser(id: string) {
  return useSWR<AppUser | null, Error>(id ? ["user", id] : null, () => getUserById(id), {
    revalidateOnFocus: false,
    onError: handleAuthError,
  });
}
