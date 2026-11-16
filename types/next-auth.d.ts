import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    rol?: string | null;
    backendToken?: string;
  }
  interface Session {
    backendToken?: string;
    user: { id: string; rol: string | null } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    rol?: string | null;
    backendToken?: string;
    backendExp?: number;
  }
}
