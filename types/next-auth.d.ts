import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    rol?: string | null;
    backendToken?: string;
  }
  interface Session {
    backendToken?: string;
    user: {
      id: string;
      rol: string | null;
      fullname?: string;
      token?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    fullname?: string;
    rol?: string | null;
    backendToken?: string;
    backendExp?: number;
  }
}
