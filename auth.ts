import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google'; // 1. Importar el proveedor de Google
import { authConfig } from './auth.config';
import api from './lib/axios';
 
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    // 2. Aquí hacemos la petición y guardamos los datos en el JWT interno
    async jwt({ token, account }) {
      // 'account' solo tiene datos en el momento exacto en que el usuario hace login
      if (account?.provider === "google") {
        try {
          const response = await api.post('/user/auth/google/login', {
            id_token: account.id_token
          });
          
          const data = response.data;
          
          // Guardamos la respuesta exacta de FastAPI en el token de NextAuth
          token.id = data.id;
          token.fullname = data.fullname;
          token.rol = data.rol;
          token.backendToken = data.token; // El JWT que genera tu backend

        } catch (error) {
          console.error("Acceso denegado por el backend:", error);
          // Al lanzar un error, NextAuth bloquea el inicio de sesión y redirige a la página de error
          throw new Error("No autorizado por el backend"); 
        }
      }
      return token;
    },

    // 3. Aquí pasamos los datos del JWT interno a la sesión pública del frontend
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.fullname = token.fullname as string;
        session.user.rol = token.rol as string;
        session.user.token = token.backendToken as string; // Tu token de FastAPI
      }
      return session;
    }
  }
});