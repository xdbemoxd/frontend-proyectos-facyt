"use client";

import useSWR from "swr";
import { EQUIPMENT_KEY, RESERVATIONS_KEY, equipmentFetcher, reservationsFetcher } from "./api";
import type { EquipmentUnit, Reservation } from "./types";

export function useEquipment() {
  return useSWR<EquipmentUnit[]>(EQUIPMENT_KEY, equipmentFetcher);
}

export function useReservations() {
  return useSWR<Reservation[]>(RESERVATIONS_KEY, reservationsFetcher);
}
