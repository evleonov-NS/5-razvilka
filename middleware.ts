import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Имя cookie сессии Auth.js v5 (database strategy)
const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

/** Заготовка защиты /decisions/* без Prisma на Edge (проверка только cookie). */
export function middleware(request: NextRequest) {
  const hasSession = SESSION_COOKIES.some((name) =>
    request.cookies.has(name),
  );

  if (!hasSession) {
    const login = new URL("/login", request.url);
    login.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/decisions/:path*"],
};
