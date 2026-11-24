"use client";

import useSWR from "swr";
import {
  CATALOGS_KEY,
  PRIORITY_LOG_KEY,
  PROJECTS_KEY,
  priorityLogFetcher,
  projectCatalogsFetcher,
  projectsFetcher,
} from "./api";
import type { PriorityChange, Project, ProjectCatalogs } from "./types";

export function useProjects() {
  return useSWR<Project[]>(PROJECTS_KEY, projectsFetcher);
}

export function usePriorityLog() {
  return useSWR<PriorityChange[]>(PRIORITY_LOG_KEY, priorityLogFetcher);
}

export function useProjectCatalogs() {
  return useSWR<ProjectCatalogs>(CATALOGS_KEY, projectCatalogsFetcher);
}
