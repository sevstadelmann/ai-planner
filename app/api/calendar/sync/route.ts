import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

async function refreshGoogleToken(refreshToken: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to refresh token")
  }

  return await response.json()
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: integration, error: integrationError } = await supabase
      .from("external_integrations")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", "google_calendar")
      .eq("is_active", true)
      .maybeSingle()

    if (integrationError) {
      console.error("[v0] Error fetching integration:", integrationError)
      return NextResponse.json({ error: "Failed to fetch integration" }, { status: 500 })
    }

    if (!integration) {
      return NextResponse.json({ error: "Google Calendar not connected" }, { status: 400 })
    }

    let accessToken = integration.access_token

    // Check if token needs refresh
    const tokenExpiresAt = new Date(integration.token_expires_at)
    if (tokenExpiresAt < new Date()) {
      const tokens = await refreshGoogleToken(integration.refresh_token)
      accessToken = tokens.access_token

      // Update tokens in database
      const expiresAt = new Date()
      expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in)

      await supabase
        .from("external_integrations")
        .update({
          access_token: tokens.access_token,
          token_expires_at: expiresAt.toISOString(),
        })
        .eq("id", integration.id)
    }

    // Get user's workouts and meals for the next 7 days
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)

    const { data: workouts } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", user.id)
      .gte("scheduled_date", today.toISOString())
      .lte("scheduled_date", nextWeek.toISOString())

    const { data: meals } = await supabase
      .from("meals")
      .select("*")
      .eq("user_id", user.id)
      .gte("scheduled_date", today.toISOString())
      .lte("scheduled_date", nextWeek.toISOString())

    // Sync events to Google Calendar
    const events = []

    // Add workouts
    if (workouts) {
      for (const workout of workouts) {
        const startTime = new Date(workout.scheduled_date)
        const endTime = new Date(startTime)
        endTime.setMinutes(endTime.getMinutes() + (workout.duration_minutes || 60))

        const event = {
          summary: `🏋️ ${workout.name}`,
          description: workout.description || "",
          start: {
            dateTime: startTime.toISOString(),
            timeZone: "UTC",
          },
          end: {
            dateTime: endTime.toISOString(),
            timeZone: "UTC",
          },
          colorId: "9", // Blue
        }

        const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        })

        if (response.ok) {
          events.push({ type: "workout", name: workout.name })
        }
      }
    }

    // Add meals
    if (meals) {
      for (const meal of meals) {
        const startTime = new Date(meal.scheduled_date)
        const endTime = new Date(startTime)
        endTime.setMinutes(endTime.getMinutes() + 30)

        const event = {
          summary: `🍽️ ${meal.name}`,
          description: meal.description || "",
          start: {
            dateTime: startTime.toISOString(),
            timeZone: "UTC",
          },
          end: {
            dateTime: endTime.toISOString(),
            timeZone: "UTC",
          },
          colorId: "10", // Green
        }

        const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        })

        if (response.ok) {
          events.push({ type: "meal", name: meal.name })
        }
      }
    }

    // Update last synced timestamp
    await supabase
      .from("external_integrations")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("id", integration.id)

    return NextResponse.json({ success: true, synced: events.length, events })
  } catch (error: any) {
    console.error("Calendar sync error:", error)
    return NextResponse.json({ error: error.message || "Failed to sync calendar" }, { status: 500 })
  }
}
