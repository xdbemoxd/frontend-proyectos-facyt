import type { DefaultSession } from "next-auth";

/**
 * Tipos de la sesión pública de NextAuth.
 *
 * IMPORTANTE: el JWT del backend (`backendToken`) NO forma parte de la
 * sesión pública ni del `User` público. Vive solo dentro de la cookie
 * cifrada de Auth.js y se lee en el servidor (lib/backend.ts).
 */
declare module "next-auth" {
  interface User {
    fullname?: string;
    rol?: string;
  }

  interface Session {
    user: {
      id: string;
      fullname: string;
      rol: string;
    } & DefaultSession["user"];
  }
}

/** Payload interno de la cookie cifrada (nunca se serializa al cliente). */
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    fullname?: string;
    rol?: string;
    backendToken?: string;
  }
}
