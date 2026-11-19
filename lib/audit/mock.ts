import type { AuditEntry } from "./types";

const H = 60 * 60 * 1000;
const ago = (hours: number) => new Date(Date.now() - hours * H).toISOString();

const LAURA = { id: "u-5", full_name: "Laura Silva", email: "lsilva@uc.edu.ve" };
const MARIA = { id: "u-1", full_name: "María Rivas", email: "mrivas@uc.edu.ve" };
const JOSE = { id: "u-2", full_name: "José Pérez", email: "jperez@uc.edu.ve" };
const CARLOS = { id: "u-4", full_name: "Carlos Mendoza", email: "cmendoza@uc.edu.ve" };

export const AUDIT_USERS = [CARLOS, LAURA, MARIA, JOSE];

const j = (o: unknown) => JSON.stringify(o);

/** Registros de ejemplo con fechas relativas a hoy (para que el filtro de 7 dias muestre datos). */
export const MOCK_AUDIT: AuditEntry[] = [
  { id: "al-01", timestamp: ago(1), user: LAURA, ip_address: "192.168.1.20", entity: "Project", action: "update_priority",
    entity_id: "0193a1b2-0001", entity_label: "FACYT-QUI-2026-001", outcome: "success",
    before_str: j({ priority: "Alta" }), after_str: j({ priority: "Crítica" }) },
  { id: "al-02", timestamp: ago(2), user: JOSE, ip_address: "192.168.1.34", entity: "Expense", action: "approve",
    entity_id: "01942000-0001", entity_label: "Reposición de nitrato", outcome: "denied",
    before_str: null, after_str: null },
  { id: "al-03", timestamp: ago(3), user: MARIA, ip_address: "192.168.1.15", entity: "Dispatch", action: "dispatch",
    entity_id: "01940000-0002", entity_label: "Guantes de nitrilo · 2 caja", outcome: "success",
    before_str: null, after_str: j({ use_raw_materials: 2, project: "FACYT-QUI-2026-001" }) },
  { id: "al-04", timestamp: ago(5), user: MARIA, ip_address: "192.168.1.15", entity: "Dispatch", action: "dispatch",
    entity_id: null, entity_label: "Etanol 96% · 20 L", outcome: "failed",
    before_str: null, after_str: j({ error: "Stock insuficiente. Disponible: 12, Solicitado: 20" }) },
  { id: "al-05", timestamp: ago(8), user: LAURA, ip_address: "192.168.1.20", entity: "Lot", action: "register_lot",
    entity_id: "0193f000-0003", entity_label: "Etanol 96% · LabSupply", outcome: "success",
    before_str: j({ current_stock: 0 }), after_str: j({ current_stock: 12 }) },
  { id: "al-06", timestamp: ago(20), user: CARLOS, ip_address: "10.0.0.5", entity: "User", action: "create",
    entity_id: "u-6", entity_label: "rtorres@uc.edu.ve", outcome: "success",
    before_str: null, after_str: j({ email: "rtorres@uc.edu.ve", rol: "coordinador" }) },
  { id: "al-07", timestamp: ago(26), user: null, ip_address: "181.208.44.9", entity: "Session", action: "login_denied",
    entity_id: null, entity_label: "desconocido@gmail.com", outcome: "denied",
    before_str: null, after_str: j({ reason: "Correo no registrado" }) },
  { id: "al-08", timestamp: ago(30), user: CARLOS, ip_address: "10.0.0.5", entity: "User", action: "deactivate",
    entity_id: "u-3", entity_label: "agomez@uc.edu.ve", outcome: "success",
    before_str: j({ is_active: true }), after_str: j({ is_active: false }) },
  { id: "al-09", timestamp: ago(44), user: LAURA, ip_address: "192.168.1.20", entity: "Expense", action: "approve",
    entity_id: "01942000-0002", entity_label: "Guantes para el equipo", outcome: "success",
    before_str: j({ status: "Pendiente de Aprobación" }), after_str: j({ status: "Aprobado" }) },
  { id: "al-10", timestamp: ago(50), user: JOSE, ip_address: "192.168.1.34", entity: "Reservation", action: "reserve",
    entity_id: null, entity_label: "Centrífuga refrigerada", outcome: "failed",
    before_str: null, after_str: j({ error: "Conflicto de reserva con FACYT-QUI-2026-001" }) },
  { id: "al-11", timestamp: ago(52), user: JOSE, ip_address: "192.168.1.34", entity: "Reservation", action: "reserve",
    entity_id: "0193d000-0002", entity_label: "Espectrofotómetro UV-Vis", outcome: "success",
    before_str: null, after_str: j({ project: "FACYT-BIO-2026-004", from: "21/11 09:00", to: "21/11 11:30" }) },
  { id: "al-12", timestamp: ago(70), user: LAURA, ip_address: "192.168.1.20", entity: "Vendor", action: "update",
    entity_id: "0193b000-0003", entity_label: "Equipos Científicos Valencia", outcome: "success",
    before_str: j({ contact_phone: "+58 414-0000000", contact_email: null }), after_str: j({ contact_phone: "+58 414-4567890", contact_email: null }) },
  { id: "al-13", timestamp: ago(96), user: MARIA, ip_address: "192.168.1.15", entity: "Project", action: "update_priority",
    entity_id: "0193a1b2-0002", entity_label: "FACYT-BIO-2026-004", outcome: "denied",
    before_str: null, after_str: null },
  { id: "al-14", timestamp: ago(120), user: CARLOS, ip_address: "10.0.0.5", entity: "User", action: "update_role",
    entity_id: "u-5", entity_label: "lsilva@uc.edu.ve", outcome: "success",
    before_str: j({ rol: "coordinador" }), after_str: j({ rol: "aprobador" }) },
  { id: "al-15", timestamp: ago(150), user: LAURA, ip_address: "192.168.1.20", entity: "OverheadPeriod", action: "close_period",
    entity_id: "01943000-0001", entity_label: "01/10/2026 – 31/10/2026", outcome: "success",
    before_str: null, after_str: j({ criterion: "equitativo", total_cost: 900 }) },
];
