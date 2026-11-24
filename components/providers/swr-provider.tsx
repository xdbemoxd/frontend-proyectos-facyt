"use client";

import type { ReactNode } from "react";
import { SWRConfig } from "swr";

const CONFIG = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 2000,
  keepPreviousData: true,
};

export function SWRProvider({ children }: { children: ReactNode }) {
  return <SWRConfig value={CONFIG}>{children}</SWRConfig>;
}
