"use client";

import { signOut } from "next-auth/react";

let redirecting = false;

/** Cierra la sesión local y lleva a la pantalla de sesión expirada. */
export function handleSessionExpired() {
  if (redirecting) return;
  redirecting = true;
  void signOut({ redirectTo: "/session-expired" });
}
