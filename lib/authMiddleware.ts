import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get("isAuthenticated")
  const isLoginPage = request.nextUrl.pathname === "/login"
  const isRegisterPage = request.nextUrl.pathname === "/register"

  if (!isAuthenticated && !isLoginPage && !isRegisterPage) {
    return NextResponse.redirect(new URL("/register", request.url))
  }

  if (isAuthenticated && (isLoginPage || isRegisterPage)) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

