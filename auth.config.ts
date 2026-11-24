import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

/** Debe coincidir con JWT_ACCESS_TTL_MINUTES del backend (60 min). */
export const SESSION_MAX_AGE_SECONDS = 60 * 60;

/**
 * Config "edge-safe": la usa proxy.ts. No hace fetch al backend aqui;
 * el intercambio del id_token vive en auth.ts.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/unauthorized", // ?error=AccessDenied cuando FastAPI rechaza
  },
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE_SECONDS },
  providers: [
    Google({
      authorization: { params: { prompt: "select_account" } },
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      if (isOnDashboard) return isLoggedIn; // false => redirige a /login
      if (isLoggedIn && nextUrl.pathname === "/login") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
