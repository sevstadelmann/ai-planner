import { type NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname

    // Skip middleware for internal routes and static files
    if (
      pathname.startsWith("/_vercel") ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname.includes(".")
    ) {
      return NextResponse.next()
    }

    console.log("[v0] Middleware running for:", pathname)

    // This avoids the __dirname error in Edge runtime
    const response = NextResponse.next()

    // Public paths that don't require authentication
    const publicPaths = ["/login", "/onboarding", "/auth/callback"]
    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

    // Check if user has session cookie
    const hasSessionCookie = request.cookies.has("sb-difabskwzjbhjiwpdldb-auth-token")

    // Redirect to login if no session and not on public path
    if (!hasSessionCookie && !isPublicPath) {
      console.log("[v0] Redirecting to login - no session cookie")
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      return NextResponse.redirect(url)
    }

    // Redirect to home if has session and on login page
    if (hasSessionCookie && pathname === "/login") {
      console.log("[v0] Redirecting to home - user has session")
      const url = request.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }

    console.log("[v0] Allowing request to proceed")
    return response
  } catch (error) {
    console.error("[v0] Middleware error:", error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|_vercel|api|auth|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
