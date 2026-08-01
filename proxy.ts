import { NextResponse, type NextRequest } from "next/server";
import { auth0 } from "@/lib/auth0";

// Rutas del panel administrativo: requieren una sesión real de Auth0.
// "/" es ahora la landing pública, y /booking (agenda para pacientes) y /api
// quedan fuera a propósito. Todo el panel vive bajo /panel.
const protectedPaths = ["/panel"];

// Bypass de dev: mientras el login de Auth0 (panel especialistas/recepción) se organiza,
// 'true' deja entrar al panel sin sesión, para revisar las vistas con datos M2M.
// En producción debe quedar 'false' o sin definir. Ver [[auth0-pendiente-organizar]].
const DEV_ADMIN_BYPASS = process.env.DEV_ADMIN_BYPASS === "true";

export async function proxy(request: Request) {
  const url = new URL(request.url);

  // El SDK maneja /auth/login, /auth/logout, /auth/callback, etc. y refresca
  // la cookie de sesión — esto siempre debe correr primero.
  const authRes = await auth0.middleware(request);

  if (url.pathname.startsWith("/auth")) {
    return authRes;
  }

  const isProtected = protectedPaths.some(
    (p) => url.pathname === p || url.pathname.startsWith(p + "/")
  );

  if (isProtected && !DEV_ADMIN_BYPASS) {
    // getSession() espera un NextRequest; en Next.js 16 el objeto que llega a
    // proxy() es uno en tiempo de ejecución aunque el tipo declarado sea Request.
    const session = await auth0.getSession(request as unknown as NextRequest);
    if (!session) {
      // returnTo hace que, tras el login, la persona vuelva a la página del
      // panel que quería ver en vez de caer en "/" (que ahora es la landing).
      const loginUrl = new URL("/auth/login", url.origin);
      loginUrl.searchParams.set("returnTo", url.pathname + url.search);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Se devuelven los headers que puso el middleware de Auth0 (cookies de
  // sesión renovadas, etc.) incluso en rutas no protegidas.
  return authRes;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
