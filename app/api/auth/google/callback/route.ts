import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  console.log("[v0] Google OAuth callback called")

  try {
    const url = new URL(request.url)
    const code = url.searchParams.get("code")
    const state = url.searchParams.get("state") || "/onboarding"
    const error = url.searchParams.get("error")

    let appUrl = url.origin
    const envUrl = process.env.NEXT_PUBLIC_API_URL
    if (envUrl && (envUrl.startsWith("http://") || envUrl.startsWith("https://"))) {
      appUrl = envUrl
    }

    console.log("[v0] Callback URL:", request.url)
    console.log("[v0] Code:", code ? "received" : "missing")
    console.log("[v0] State:", state)
    console.log("[v0] App URL:", appUrl)

    if (error) {
      console.log("[v0] OAuth error:", error)
      return NextResponse.redirect(`${appUrl}${state}?error=${error}`)
    }

    if (!code) {
      console.log("[v0] No authorization code received")
      return NextResponse.redirect(`${appUrl}${state}?error=no_code`)
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("[v0] User not authenticated")
      return NextResponse.redirect(`${appUrl}/login`)
    }

    console.log("[v0] Exchanging code for tokens")

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${appUrl}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error("[v0] Token exchange failed:", errorText)
      throw new Error("Failed to exchange code for tokens")
    }

    const tokens = await tokenResponse.json()
    console.log("[v0] Tokens received successfully")

    // Calculate token expiration
    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in)

    // Store tokens in database
    console.log("[v0] Storing tokens in database")
    const { error: dbError } = await supabase.from("external_integrations").upsert(
      {
        user_id: user.id,
        provider: "google_calendar",
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: expiresAt.toISOString(),
        is_active: true,
        last_synced_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,provider",
      },
    )

    if (dbError) {
      console.error("[v0] Failed to store tokens:", dbError)
      throw dbError
    }

    console.log("[v0] Google Calendar connected successfully")
    return NextResponse.redirect(`${appUrl}${state}?connected=true`)
  } catch (error) {
    console.error("[v0] Google OAuth callback error:", error)
    const url = new URL(request.url)
    const state = url.searchParams.get("state") || "/onboarding"
    let appUrl = url.origin
    const envUrl = process.env.NEXT_PUBLIC_API_URL
    if (envUrl && (envUrl.startsWith("http://") || envUrl.startsWith("https://"))) {
      appUrl = envUrl
    }
    return NextResponse.redirect(`${appUrl}${state}?error=auth_failed`)
  }
}
