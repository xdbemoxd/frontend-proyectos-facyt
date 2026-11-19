/** Tipo de recurso (private.resource_type). */
export type ResourceType = { id: number; name: string; description: string | null };

/**
 * Fila de private.v_inventory_stock_status: stock de un material
 * con un proveedor, ya con su estado calculado.
 */
export type StockItem = {
  supplier_item_id: string;
  resource_id: string;
  resource_name: string;
  resource_type: string;
  unit: string;
  vendor_name: string;
  current_stock: number;
  minimun_stock: number;
  stock_status: "Agotado" | "Alerta Stock Mínimo" | "Normal";
  is_critical: boolean;
};

/**
 * Formulario: crea la materia prima (raw_material) y su primer
 * proveedor con stock minimo (raw_material_supplier).
 * El stock actual NO se escribe: sube con los lotes y baja con los despachos.
 */
export type RawMaterialInput = {
  name: string;
  description: string | null;
  resource_type_id: number;
  unit: string;
  vendors_id: string;
  minimun_stock: number;
};
