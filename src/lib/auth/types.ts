import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      status: string;
      roles: {
        id: string;
        slug: string;
        name: string;
      }[];
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    status: string;
    roles: {
      id: string;
      slug: string;
      name: string;
    }[];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    status: string;
    roles: {
      id: string;
      slug: string;
      name: string;
    }[]
  }
}
