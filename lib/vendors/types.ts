/** Proveedor (espejo de private.vendors). */
export type Vendor = {
  id: string;
  name: string;
  description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  create_at: string; // ISO
  updated_at: string; // ISO
};

/** Datos que envia el formulario (POST /vendors y PATCH /vendors/:id). */
export type VendorInput = {
  name: string;
  description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
};
