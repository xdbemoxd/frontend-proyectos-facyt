"use client";

import useSWR from "swr";
import { PRIORITY_LOG_KEY, PROJECTS_KEY, priorityLogFetcher, projectsFetcher } from "./api";
import type { PriorityChange, Project } from "./types";

export function useProjects() {
  return useSWR<Project[]>(PROJECTS_KEY, projectsFetcher);
}

export function usePriorityLog() {
  return useSWR<PriorityChange[]>(PRIORITY_LOG_KEY, priorityLogFetcher);
}
