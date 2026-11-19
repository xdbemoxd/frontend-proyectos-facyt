/** Despacho (private.dispatch_log) con FK resueltas. */
export type Dispatch = {
  id: string;
  supplier_item: { id: string; resource_name: string; vendor_name: string; unit: string };
  project: { id: string; unique_code: string; name: string };
  user: { id: string; full_name: string }; // responsable del retiro
  use_raw_materials: number;
  material_requested_at: string; // fecha y hora, ISO
  notes: string | null;
};

/** Formulario (POST /inventory/dispatch). El usuario sale del token. */
export type DispatchInput = {
  id_raw_materials_suppliers: string;
  id_project: string;
  use_raw_materials: number;
  notes: string | null;
};
