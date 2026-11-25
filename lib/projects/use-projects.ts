"use client";

import useSWR from "swr";
import {
  CATALOGS_KEY,
  COORDINATORS_KEY,
  coordinatorsFetcher,
  PRIORITY_LOG_KEY,
  PROJECTS_KEY,
  priorityLogFetcher,
  projectCatalogsFetcher,
  projectsFetcher,
} from "./api";
import type { Coordinator, PriorityChange, Project, ProjectCatalogs } from "./types";

export function useProjects() {
  return useSWR<Project[]>(PROJECTS_KEY, projectsFetcher);
}

export function usePriorityLog() {
  return useSWR<PriorityChange[]>(PRIORITY_LOG_KEY, priorityLogFetcher);
}

export function useProjectCatalogs() {
  return useSWR<ProjectCatalogs>(CATALOGS_KEY, projectCatalogsFetcher);
}

/** Solo el administrador elige responsable: para el resto no se pide nada. */
export function useCoordinators(enabled: boolean) {
  return useSWR<Coordinator[]>(enabled ? COORDINATORS_KEY : null, coordinatorsFetcher, {
    revalidateOnFocus: false,
  });
}

