import type { DefaultSession, DefaultUser } from "next-auth";
import { type DefaultJWT, JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      status: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    status: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    status: string;
  }
}
