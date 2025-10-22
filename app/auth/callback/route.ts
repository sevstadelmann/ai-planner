import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const origin = requestUrl.origin

  console.log("[v0] Auth callback received, code:", code ? "present" : "missing")

  if (code) {
    const cookieStore = await cookies()
    const response = NextResponse.redirect(`${origin}/`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            // Set cookies on both the cookie store and the response
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
              response.cookies.set(name, value, options)
            })
          },
        },
      },
    )

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("[v0] Error exchanging code for session:", error)
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
      }

      console.log("[v0] Successfully exchanged code for session")
      console.log("[v0] Session cookies should now be set")

      // Check if user has completed onboarding
      if (data.user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle()

        if (profile && profile.height_cm) {
          // Profile complete, redirect to home
          console.log("[v0] Profile complete, redirecting to home")
          return NextResponse.redirect(`${origin}/`)
        } else {
          // Profile incomplete, redirect to onboarding
          console.log("[v0] Profile incomplete, redirecting to onboarding")
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }

      return response
    } catch (err) {
      console.error("[v0] Unexpected error in auth callback:", err)
      return NextResponse.redirect(`${origin}/login?error=authentication_failed`)
    }
  }

  // No code present, redirect to login
  console.log("[v0] No code present, redirecting to login")
  return NextResponse.redirect(`${origin}/login`)
}
