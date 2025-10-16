import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const origin = requestUrl.origin

  console.log("[v0] Calendar callback received")

  if (code) {
    const supabase = await createClient()

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("[v0] Error in calendar callback:", error)
        return NextResponse.redirect(`${origin}/settings?calendar_error=${encodeURIComponent(error.message)}`)
      }

      // Store calendar connection in database
      if (data.user && data.session?.provider_token) {
        await supabase.from("external_integrations").upsert({
          user_id: data.user.id,
          provider: "google_calendar",
          access_token: data.session.provider_token,
          refresh_token: data.session.provider_refresh_token || "",
          is_active: true,
          connected_at: new Date().toISOString(),
        })

        console.log("[v0] Calendar connected successfully")
        return NextResponse.redirect(`${origin}/settings?calendar_connected=true`)
      }
    } catch (err) {
      console.error("[v0] Unexpected error in calendar callback:", err)
      return NextResponse.redirect(`${origin}/settings?calendar_error=connection_failed`)
    }
  }

  return NextResponse.redirect(`${origin}/settings`)
}
