/** Codigos del backend -> texto en espanol. Agregar aqui las acciones nuevas. */
export const ACTION_LABELS: Record<string, string> = {
  create: "Creó",
  update: "Editó",
  delete: "Eliminó",
  login: "Inició sesión",
  login_denied: "Intento de inicio de sesión",
  update_priority: "Cambió la prioridad",
  update_status: "Cambió el estado",
  approve: "Aprobó",
  reject: "Rechazó",
  dispatch: "Despachó material",
  register_lot: "Registró un lote",
  close_period: "Cerró un período",
  reserve: "Reservó un equipo",
  update_role: "Cambió el rol",
  deactivate: "Desactivó la cuenta",
  http_request: "Petición HTTP",
  create_user: "Creó usuario",
  update_user: "Editó usuario",
  create_user_denied: "Intento de crear usuario",
  update_user_denied: "Intento de editar usuario",
  rbac_denied: "Acceso denegado",
  logout: "Cerró sesión",
  bootstrap_create: "Creó usuario (bootstrap)",
  test_business_event: "Evento de prueba",
};

export const ENTITY_LABELS: Record<string, string> = {
  Project: "Proyecto",
  User: "Usuario",
  Vendor: "Proveedor",
  RawMaterial: "Materia prima",
  Lot: "Lote de compra",
  Dispatch: "Despacho",
  Equipment: "Equipo",
  Reservation: "Reserva",
  Expense: "Solicitud de gasto",
  OverheadPeriod: "Período de prorrateo",
  Session: "Sesión",
  HTTP: "Petición HTTP",
  Test: "Prueba",
};

/** Nombres de campos para el detalle antes/despues. */
export const FIELD_LABELS: Record<string, string> = {
  id_priority: "Prioridad",
  priority: "Prioridad",
  id_status: "Estado",
  status: "Estado",
  id_rol: "Rol",
  rol: "Rol",
  is_active: "Cuenta activa",
  name: "Nombre",
  current_stock: "Stock actual",
  minimun_stock: "Stock mínimo",
  contact_email: "Correo",
  contact_phone: "Teléfono",
  progress: "Avance",
  budget_execution: "Ejecución presupuestaria",
};

export const OUTCOME_LABELS = { success: "Éxito", denied: "Denegado", failed: "Fallido" } as const;

export const actionLabel = (a: string) => ACTION_LABELS[a] ?? a;
export const entityLabel = (e: string) => ENTITY_LABELS[e] ?? e;
export const fieldLabel = (f: string) => FIELD_LABELS[f] ?? f;
