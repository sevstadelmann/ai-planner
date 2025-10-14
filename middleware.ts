import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip authentication for internal routes
  if (
    pathname.startsWith("/_vercel") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // Skip files with extensions
  ) {
    return NextResponse.next()
  }

  console.log("[v0] Middleware running for:", pathname)

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://difabskwzjbhjiwpdldb.supabase.co"
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZmFic2t3empiaGppd3BkbGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDAxMzQsImV4cCI6MjA3NTQ3NjEzNH0.FLhdUW9BN8fpSGU9XgsBHybwwjb5VGQshg5B838JN8g"

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  // IMPORTANT: Do not run code between createServerClient and supabase.auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("[v0] User authenticated:", !!user, "Path:", pathname)

  const publicPaths = ["/login", "/onboarding"]
  const isPublicPath = publicPaths.includes(pathname)

  // Redirect to login if not authenticated (except for public paths)
  if (!user && !isPublicPath) {
    console.log("[v0] Redirecting to login - user not authenticated")
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  if (user && pathname === "/login") {
    // Check if user has completed onboarding by checking if profile exists
    const { data: profile } = await supabase.from("profiles").select("id, full_name").eq("id", user.id).maybeSingle()

    if (profile && profile.full_name) {
      // Profile is complete, redirect to home
      console.log("[v0] Redirecting to home - user authenticated and onboarded")
      const url = request.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    } else {
      // Profile incomplete, redirect to onboarding
      console.log("[v0] Redirecting to onboarding - user authenticated but not onboarded")
      const url = request.nextUrl.clone()
      url.pathname = "/onboarding"
      return NextResponse.redirect(url)
    }
  }

  console.log("[v0] Allowing request to proceed")
  return supabaseResponse
}

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _vercel (Vercel internal routes)
     * - api (API routes)
     * - auth (OAuth callback routes)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|_vercel|api|auth|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
