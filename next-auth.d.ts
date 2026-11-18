import { DefaultSession } from "next-auth";

declare module "next-auth" {
  declare module "next-auth" {
  // 1. Extendemos la interfaz User (esto quita el error actual)
  interface User {
    fullname?: string;
    rol?: string;
    token?: string;
  }

  // 2. Mantenemos la extensión de la Sesión para el frontend
  interface Session {
    user: {
      id: string;
      fullname: string;
      rol: string;
      token: string;
    } & DefaultSession["user"];
  }
}

// 3. Extendemos el JWT para cuando asignes token.fullname en el callback jwt
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    fullname?: string;
    rol?: string;
    backendToken?: string;
  }
}
}