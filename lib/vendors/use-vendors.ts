"use client";

import useSWR from "swr";
import { VENDORS_KEY, vendorsFetcher } from "./api";
import type { Vendor } from "./types";

export function useVendors() {
  return useSWR<Vendor[]>(VENDORS_KEY, vendorsFetcher);
}
