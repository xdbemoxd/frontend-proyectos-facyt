"use client";

import { useEffect, useState } from "react";
import { fetchRoles } from "./api";
import type { Role } from "./types";

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    let active = true;
    fetchRoles()
      .then((result) => {
        if (active) setRoles(result);
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e : new Error(String(e)));
      });
    return () => {
      active = false;
    };
  }, []);

  return { roles, error };
}
