"use client";

import { useCallback, useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { USERS_KEY, usersFetcher } from "./api";
import type { AppUser } from "./types";

/**
 * Misma forma que useSWR. Para migrar (pnpm add swr):
 *   return useSWR<AppUser[]>(USERS_KEY, usersFetcher);
 */
export function useUsers() {
  const [data, setData] = useState<AppUser[] | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const mutate = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await usersFetcher(USERS_KEY);
      setData(result);
      setError(undefined);
      return result;
    } catch (e) {
      if (e instanceof Error && e.message === "No autenticado") {
        await signOut({ redirectTo: "/login?error=SessionExpired" });
        return;
      }
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void mutate();
  }, [mutate]);

  return { data, error, isLoading, mutate };
}
