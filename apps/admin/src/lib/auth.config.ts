/**
 * auth.config.ts — Edge-compatible auth configuration (admin)
 * Sem bcryptjs, sem @prisma/client → pode ser importado no middleware
 */
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [], // Credentials adicionado somente em auth.ts (Node.js)
  session: {
    strategy: "jwt" as const,
    maxAge: 8 * 60 * 60, // 8 horas
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
      const isLoginPage = nextUrl.pathname === "/login";

      if (isLoginPage && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      if (!isLoginPage && !isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }
      return true;
    },
  },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
