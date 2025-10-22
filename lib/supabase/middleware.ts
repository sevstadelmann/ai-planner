import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] CRITICAL: Supabase environment variables not set!")
    console.error("[v0] NEXT_PUBLIC_SUPABASE_URL:", !!supabaseUrl)
    console.error("[v0] NEXT_PUBLIC_SUPABASE_ANON_KEY:", !!supabaseAnonKey)

    // Redirect to login with error
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("error", "configuration_error")
    return NextResponse.redirect(url)
  }

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
