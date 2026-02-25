import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/lgpd",
  "/produtos",
];

const AUTH_ROUTES = ["/login", "/register", "/lgpd"];

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) =>
      nextUrl.pathname === route || nextUrl.pathname.startsWith("/produtos")
  );
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => nextUrl.pathname === route
  );

  // Se está na rota de auth e já está logado, redireciona para dashboard
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Se rota protegida e não está logado, redireciona para login
  if (!isPublicRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons|images).*)"],
};
