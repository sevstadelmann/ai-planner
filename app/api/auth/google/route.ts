import { NextResponse } from "next/server"

export async function GET(request: Request) {
  console.log("[v0] Google auth route called")

  try {
    const url = new URL(request.url)
    const redirectUrl = url.searchParams.get("redirect") || "/onboarding"

    console.log("[v0] Request URL:", request.url)
    console.log("[v0] Redirect URL:", redirectUrl)

    // Google OAuth configuration
    const googleClientId = process.env.GOOGLE_CLIENT_ID

    let appUrl = url.origin
    const envUrl = process.env.NEXT_PUBLIC_API_URL
    if (envUrl && (envUrl.startsWith("http://") || envUrl.startsWith("https://"))) {
      appUrl = envUrl
    }

    const googleRedirectUri = `${appUrl}/api/auth/google/callback`

    console.log("[v0] Google Client ID:", googleClientId ? "configured" : "missing")
    console.log("[v0] App URL:", appUrl)
    console.log("[v0] Redirect URI:", googleRedirectUri)

    if (!googleClientId) {
      return NextResponse.json(
        { error: "Google OAuth not configured. Please add GOOGLE_CLIENT_ID to environment variables." },
        { status: 500 },
      )
    }

    // Build Google OAuth URL
    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
    googleAuthUrl.searchParams.set("client_id", googleClientId)
    googleAuthUrl.searchParams.set("redirect_uri", googleRedirectUri)
    googleAuthUrl.searchParams.set("response_type", "code")
    googleAuthUrl.searchParams.set(
      "scope",
      "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
    )
    googleAuthUrl.searchParams.set("access_type", "offline")
    googleAuthUrl.searchParams.set("prompt", "consent")
    googleAuthUrl.searchParams.set("state", redirectUrl)

    console.log("[v0] Redirecting to Google OAuth:", googleAuthUrl.toString())

    return NextResponse.redirect(googleAuthUrl.toString())
  } catch (error) {
    console.error("[v0] Error in Google auth route:", error)
    return NextResponse.json(
      { error: "Failed to initiate Google OAuth", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
