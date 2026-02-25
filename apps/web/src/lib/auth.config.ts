/**
 * auth.config.ts — Edge-compatible auth configuration
 * Sem bcryptjs, sem @prisma/client → pode ser importado no middleware
 * O Credentials provider (com bcrypt) fica apenas em auth.ts
 */
import type { NextAuthConfig } from "next-auth";

const PUBLIC_PATHS = ["/", "/login", "/register", "/lgpd"];
const AUTH_PATHS = ["/login", "/register", "/lgpd"];

export const authConfig = {
  providers: [], // Credentials adicionado somente em auth.ts (Node.js)
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;

      const isPublic =
        PUBLIC_PATHS.includes(path) || path.startsWith("/produtos");
      const isAuthRoute = AUTH_PATHS.includes(path);

      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      if (!isPublic && !isLoggedIn) {
        const loginUrl = new URL("/login", nextUrl);
        loginUrl.searchParams.set("callbackUrl", path);
        return Response.redirect(loginUrl);
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
