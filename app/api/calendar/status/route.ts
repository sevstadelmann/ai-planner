import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isTableNotFoundError = (error: any): boolean => {
      if (!error) return false
      const errorMessage = String(error?.message || error || "")
      const errorCode = error?.code || ""
      return (
        errorCode === "PGRST205" ||
        errorCode === "PGRST204" ||
        errorMessage.includes("Could not find the table") ||
        errorMessage.includes("schema cache") ||
        (errorMessage.includes("relation") && errorMessage.includes("does not exist"))
      )
    }

    try {
      const { data: integration, error } = await supabase
        .from("external_integrations")
        .select("*")
        .eq("user_id", user.id)
        .eq("provider", "google_calendar")
        .eq("is_active", true)
        .maybeSingle()

      if (error && !isTableNotFoundError(error)) {
        console.error("[v0] Error checking calendar status:", error.message)
      }

      // Return not connected if table doesn't exist or no integration found
      return NextResponse.json({
        connected: !!integration,
        integration: integration || null,
      })
    } catch (error: any) {
      // Silently handle missing table errors
      if (!isTableNotFoundError(error)) {
        console.error("[v0] Unexpected error in calendar status:", error)
      }

      return NextResponse.json({
        connected: false,
        integration: null,
      })
    }
  } catch (error: any) {
    console.error("[v0] Error in calendar status:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
