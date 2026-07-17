import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";

const protectedPaths = ["/appointments", "/doctors", "/patients"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtected = protectedPaths.some(
    (p) => path === p || path.startsWith(p + "/")
  );

  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get("session")?.value;
  const session = await decrypt(token);

  if (!session?.admin) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
