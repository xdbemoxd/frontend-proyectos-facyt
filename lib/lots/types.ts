/**
 * Lote de compra / entrada de almacen (private.audith_raw_material_supplier)
 * con la FK resuelta (material + proveedor).
 */
export type Lot = {
  id: string;
  supplier_item: {
    id: string; // raw_material_supplier.id
    resource_name: string;
    vendor_name: string;
    unit: string;
  };
  in_date: string; // ISO
  count_raw_materials_in: number;
  unit_cost: number;
  invoice_reference: string | null;
  created_at: string;
};

/** Formulario (POST /inventory/lots). */
export type LotInput = {
  id_raw_materials_supplier: string;
  in_date: string; // ISO
  count_raw_materials_in: number;
  unit_cost: number;
  invoice_reference: string | null;
};
