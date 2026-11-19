import type { ResourceType, StockItem } from "./types";

export const RESOURCE_TYPES: ResourceType[] = [
  { id: 1, name: "Materia prima", description: "Insumo que se transforma en el proyecto" },
  { id: 2, name: "Consumible", description: "Material de uso general (overhead)" },
  { id: 3, name: "Reactivo", description: "Sustancia química de laboratorio" },
];

export const UNITS = ["unidad", "g", "kg", "mL", "L", "caja", "paquete"];

export const MOCK_STOCK: StockItem[] = [
  {
    supplier_item_id: "0193e000-0001-7000-8000-000000000001",
    resource_id: "rm-1", resource_name: "Nitrato de plata", resource_type: "Reactivo", unit: "g",
    vendor_name: "Químicos del Centro C.A.",
    current_stock: 250, minimun_stock: 100, stock_status: "Normal", is_critical: false,
  },
  {
    supplier_item_id: "0193e000-0002-7000-8000-000000000002",
    resource_id: "rm-2", resource_name: "Guantes de nitrilo talla M", resource_type: "Consumible", unit: "caja",
    vendor_name: "LabSupply Venezuela",
    current_stock: 4, minimun_stock: 10, stock_status: "Alerta Stock Mínimo", is_critical: true,
  },
  {
    supplier_item_id: "0193e000-0003-7000-8000-000000000003",
    resource_id: "rm-3", resource_name: "Etanol 96%", resource_type: "Reactivo", unit: "L",
    vendor_name: "Químicos del Centro C.A.",
    current_stock: 0, minimun_stock: 5, stock_status: "Agotado", is_critical: true,
  },
  {
    supplier_item_id: "0193e000-0004-7000-8000-000000000004",
    resource_id: "rm-4", resource_name: "Papel absorbente", resource_type: "Consumible", unit: "paquete",
    vendor_name: "LabSupply Venezuela",
    current_stock: 32, minimun_stock: 8, stock_status: "Normal", is_critical: false,
  },
  {
    supplier_item_id: "0193e000-0005-7000-8000-000000000005",
    resource_id: "rm-3", resource_name: "Etanol 96%", resource_type: "Reactivo", unit: "L",
    vendor_name: "LabSupply Venezuela",
    current_stock: 12, minimun_stock: 5, stock_status: "Normal", is_critical: false,
  },
];
