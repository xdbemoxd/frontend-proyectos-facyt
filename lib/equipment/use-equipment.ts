"use client";

import useSWR from "swr";
import {
  EQUIPMENT_CATALOGS_KEY,
  EQUIPMENT_KEY,
  RESERVATIONS_KEY,
  equipmentCatalogsFetcher,
  equipmentFetcher,
  reservationsFetcher,
} from "./api";
import type { EquipmentCatalogs, EquipmentUnit, Reservation } from "./types";

export function useEquipment() {
  return useSWR<EquipmentUnit[]>(EQUIPMENT_KEY, equipmentFetcher);
}

export function useReservations() {
  return useSWR<Reservation[]>(RESERVATIONS_KEY, reservationsFetcher);
}

export function useEquipmentCatalogs() {
  return useSWR<EquipmentCatalogs>(
    EQUIPMENT_CATALOGS_KEY,
    equipmentCatalogsFetcher
  );
}
