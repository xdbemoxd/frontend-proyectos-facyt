"use client";

import { getVendor } from "@/lib/vendors/api";
import { RecordStatus, useRecord } from "@/components/forms/record-loader";
import { VendorForm } from "./vendor-form";

export function VendorEdit({ id }: { id: string }) {
  const vendor = useRecord(getVendor, id);
  if (!vendor) return <RecordStatus loading={vendor === undefined} notFound="Proveedor no encontrado." />;
  return <VendorForm vendor={vendor} />;
}
