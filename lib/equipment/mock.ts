import type { EquipmentStatus, EquipmentUnit, Reservation } from "./types";

export const EQUIPMENT_STATUS: EquipmentStatus[] = [
  { id: 1, name: "Disponible", description: "Listo para usar" },
  { id: 2, name: "En uso", description: "Asignado a un proyecto" },
  { id: 3, name: "En mantenimiento", description: "Fuera de servicio temporalmente" },
];

const [DISPONIBLE, EN_USO, MANTENIMIENTO] = EQUIPMENT_STATUS;

export const MOCK_UNITS: EquipmentUnit[] = [
  {
    id: "0193c000-0001-7000-8000-000000000001",
    equipment: { id: "eq-1", name: "Espectrofotómetro UV-Vis", description: "Análisis de absorbancia 190-1100 nm." },
    vendor: { id: "0193b000-0003-7000-8000-000000000003", name: "Equipos Científicos Valencia" },
    status: DISPONIBLE,
    model: "Genesys 150",
    serial_number: "GEN150-88213",
    create_at: "2026-03-10T13:00:00Z",
    updated_at: "2026-11-02T10:00:00Z",
  },
  {
    id: "0193c000-0002-7000-8000-000000000002",
    equipment: { id: "eq-2", name: "Centrífuga refrigerada", description: "Hasta 15.000 rpm, 4 °C." },
    vendor: { id: "0193b000-0003-7000-8000-000000000003", name: "Equipos Científicos Valencia" },
    status: EN_USO,
    model: "Sorvall ST 8R",
    serial_number: "ST8R-40177",
    create_at: "2026-01-22T15:00:00Z",
    updated_at: "2026-11-15T09:30:00Z",
  },
  {
    id: "0193c000-0003-7000-8000-000000000003",
    equipment: { id: "eq-3", name: "Campana de extracción", description: null },
    vendor: { id: "0193b000-0002-7000-8000-000000000002", name: "LabSupply Venezuela" },
    status: MANTENIMIENTO,
    model: null,
    serial_number: "CE-2024-003",
    create_at: "2025-08-05T11:00:00Z",
    updated_at: "2026-10-30T16:20:00Z",
  },
  {
    id: "0193c000-0004-7000-8000-000000000004",
    equipment: { id: "eq-1", name: "Espectrofotómetro UV-Vis", description: "Análisis de absorbancia 190-1100 nm." },
    vendor: { id: "0193b000-0003-7000-8000-000000000003", name: "Equipos Científicos Valencia" },
    status: DISPONIBLE,
    model: "Genesys 150",
    serial_number: "GEN150-88250",
    create_at: "2026-06-18T12:00:00Z",
    updated_at: "2026-06-18T12:00:00Z",
  },
];

export const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: "0193d000-0001-7000-8000-000000000001",
    unit: { id: "0193c000-0002-7000-8000-000000000002", equipment_name: "Centrífuga refrigerada", serial_number: "ST8R-40177" },
    project: { id: "0193a1b2-0001-7000-8000-000000000001", unique_code: "FACYT-QUI-2026-001", name: "Síntesis de nanopartículas de plata" },
    user: { id: "u-1", full_name: "María Rivas" },
    reservation_date: "2026-11-19T12:00:00Z",
    end_date: "2026-11-19T16:00:00Z",
    purpose: "Separación de nanopartículas.",
    created_date: "2026-11-14T10:00:00Z",
  },
  {
    id: "0193d000-0002-7000-8000-000000000002",
    unit: { id: "0193c000-0001-7000-8000-000000000001", equipment_name: "Espectrofotómetro UV-Vis", serial_number: "GEN150-88213" },
    project: { id: "0193a1b2-0002-7000-8000-000000000002", unique_code: "FACYT-BIO-2026-004", name: "Biorremediación de suelos contaminados" },
    user: { id: "u-2", full_name: "José Pérez" },
    reservation_date: "2026-11-21T13:00:00Z",
    end_date: "2026-11-21T15:30:00Z",
    purpose: null,
    created_date: "2026-11-16T08:15:00Z",
  },
];
