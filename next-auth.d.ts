import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      fullname: string;
      rol: string;
      token: string;
    } & DefaultSession["user"];
  }
}