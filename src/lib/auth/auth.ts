import bcrypt from "bcryptjs";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/server/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            Roles: {
              include: {
                Role: true,
              },
            },
          },
        });

        if (!user || user.status !== "ACTIVE") {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash,
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          status: user.status,
          roles: user.Roles.map((role) => ({
            id: role.Role.id,
            slug: role.Role.slug,
            name: role.Role.name,
          })),
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.status = user.status;
        token.roles = user.roles;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.status = token.status as string;
        session.user.roles = token.roles as {
          id: string;
          slug: string;
          name: string;
        }[];
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export function getSession() {
  return getServerSession(authOptions);
}
