import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get start date from query params (defaults to today)
    const url = new URL(request.url)
    const startDateParam = url.searchParams.get("startDate")
    const startDate = startDateParam ? new Date(startDateParam) : new Date()

    // Calculate end date (7 days from start)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 7)

    const isTableNotFoundError = (error: any): boolean => {
      if (!error) return false
      const errorMessage = String(error?.message || error || "")
      const errorCode = error?.code || ""
      const errorDetails = error?.details || ""
      return (
        errorCode === "PGRST205" ||
        errorCode === "PGRST204" ||
        errorMessage.includes("Could not find the table") ||
        errorMessage.includes("schema cache") ||
        (errorMessage.includes("relation") && errorMessage.includes("does not exist")) ||
        errorDetails?.includes("table")
      )
    }

    let workouts: any[] = []
    try {
      const { data: workoutsData, error: workoutsError } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", user.id)
        .gte("scheduled_date", startDate.toISOString())
        .lt("scheduled_date", endDate.toISOString())
        .order("scheduled_date", { ascending: true })

      if (workoutsError && !isTableNotFoundError(workoutsError)) {
        console.error("[v0] Error fetching workouts:", workoutsError.message)
      } else if (workoutsData) {
        workouts = workoutsData
      }
    } catch (error: any) {
      if (!isTableNotFoundError(error)) {
        console.error("[v0] Unexpected error fetching workouts:", error)
      }
      // Continue with empty array
    }

    let meals: any[] = []
    try {
      const { data: mealsData, error: mealsError } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", user.id)
        .gte("scheduled_date", startDate.toISOString())
        .lt("scheduled_date", endDate.toISOString())
        .order("scheduled_date", { ascending: true })

      if (mealsError && !isTableNotFoundError(mealsError)) {
        console.error("[v0] Error fetching meals:", mealsError.message)
      } else if (mealsData) {
        meals = mealsData
      }
    } catch (error: any) {
      if (!isTableNotFoundError(error)) {
        console.error("[v0] Unexpected error fetching meals:", error)
      }
      // Continue with empty array
    }

    // Organize data by date
    const scheduleByDate: Record<string, any[]> = {}

    // Add workouts
    workouts?.forEach((workout) => {
      const date = new Date(workout.scheduled_date).toISOString().split("T")[0]
      if (!scheduleByDate[date]) scheduleByDate[date] = []
      scheduleByDate[date].push({
        id: workout.id,
        time: new Date(workout.scheduled_date).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        type: "workout",
        title: workout.name,
        description: workout.description,
        duration: workout.duration_minutes,
        color: "bg-blue-400",
      })
    })

    // Add meals
    meals?.forEach((meal) => {
      const date = new Date(meal.scheduled_date).toISOString().split("T")[0]
      if (!scheduleByDate[date]) scheduleByDate[date] = []
      scheduleByDate[date].push({
        id: meal.id,
        time: new Date(meal.scheduled_date).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        type: "meal",
        title: meal.name,
        description: meal.description,
        calories: meal.calories,
        color: "bg-green-400",
      })
    })

    // Sort events within each day by time
    Object.keys(scheduleByDate).forEach((date) => {
      scheduleByDate[date].sort((a, b) => a.time.localeCompare(b.time))
    })

    return NextResponse.json({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      schedule: scheduleByDate,
      summary: {
        totalWorkouts: workouts?.length || 0,
        totalMeals: meals?.length || 0,
        totalEvents: (workouts?.length || 0) + (meals?.length || 0),
      },
    })
  } catch (error: any) {
    console.error("[v0] Error fetching weekly schedule:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch schedule" }, { status: 500 })
  }
}
