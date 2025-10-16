import { createClient } from "@/lib/supabase/client"

export async function connectGoogleCalendar() {
  const redirectUrl = window.location.pathname
  window.location.href = `/api/auth/google?redirect=${encodeURIComponent(redirectUrl)}`
}

export async function disconnectGoogleCalendar() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("external_integrations")
    .update({ is_active: false })
    .eq("user_id", user.id)
    .eq("provider", "google_calendar")

  if (error) throw error
}

export async function syncGoogleCalendar() {
  const response = await fetch("/api/calendar/sync", {
    method: "POST",
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to sync calendar")
  }

  return await response.json()
}

export async function getGoogleCalendarStatus() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { connected: false }

  const { data: integration } = await supabase
    .from("external_integrations")
    .select("*")
    .eq("user_id", user.id)
    .eq("provider", "google_calendar")
    .eq("is_active", true)
    .single()

  return {
    connected: !!integration,
    lastSynced: integration?.last_synced_at,
  }
}
