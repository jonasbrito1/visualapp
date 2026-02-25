/**
 * middleware.ts — Edge-compatible (admin)
 * Usa apenas authConfig (sem bcrypt/Prisma) para manter o bundle < 1 MB.
 */
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export const { auth: middleware } = NextAuth(authConfig);
export default middleware;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
