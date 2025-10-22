import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { date } = body

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 })
    }

    const scheduleDate = new Date(date)

    const workout = {
      user_id: user.id,
      title: "Full Body Strength Training", // Changed from 'name' to 'title'
      description: "A comprehensive full-body workout focusing on compound movements",
      workout_type: "strength", // Added required field
      scheduled_date: scheduleDate.toISOString().split("T")[0], // Date only
      scheduled_time: "09:00:00", // Separate time field
      duration_minutes: 60,
      intensity: "moderate", // Added intensity field
      exercises: [
        // Now stored as JSONB
        { name: "Squats", sets: 4, reps: 10, weight: 135 },
        { name: "Bench Press", sets: 4, reps: 8, weight: 155 },
        { name: "Deadlifts", sets: 3, reps: 8, weight: 185 },
        { name: "Pull-ups", sets: 3, reps: 10 },
      ],
    }

    const meals = [
      {
        user_id: user.id,
        title: "Protein Power Breakfast", // Changed from 'name' to 'title'
        description: "High-protein breakfast to start your day",
        scheduled_date: scheduleDate.toISOString().split("T")[0], // Date only
        scheduled_time: "07:30:00", // Separate time field
        meal_type: "breakfast",
        calories: 450,
        protein_g: 35, // Changed from 'protein' to 'protein_g'
        carbs_g: 40, // Changed from 'carbs' to 'carbs_g'
        fat_g: 15, // Changed from 'fat' to 'fat_g'
        ingredients: ["3 eggs", "2 slices whole wheat toast", "1 avocado", "Greek yogurt"],
      },
      {
        user_id: user.id,
        title: "Balanced Lunch Bowl",
        description: "Nutrient-dense lunch with lean protein and vegetables",
        scheduled_date: scheduleDate.toISOString().split("T")[0],
        scheduled_time: "12:30:00",
        meal_type: "lunch",
        calories: 550,
        protein_g: 40,
        carbs_g: 50,
        fat_g: 20,
        ingredients: ["Grilled chicken breast", "Quinoa", "Mixed vegetables", "Olive oil dressing"],
      },
      {
        user_id: user.id,
        title: "Post-Workout Dinner",
        description: "Recovery meal with optimal protein and carbs",
        scheduled_date: scheduleDate.toISOString().split("T")[0],
        scheduled_time: "18:30:00",
        meal_type: "dinner",
        calories: 650,
        protein_g: 45,
        carbs_g: 60,
        fat_g: 22,
        ingredients: ["Salmon fillet", "Sweet potato", "Broccoli", "Brown rice"],
      },
    ]

    // Save workout to database
    const { data: workoutData, error: workoutError } = await supabase.from("workouts").insert(workout).select().single()

    if (workoutError) {
      console.error("[v0] Error creating workout:", workoutError)
      throw new Error(`Failed to create workout: ${workoutError.message}`)
    }

    // Save meals to database
    const { data: mealsData, error: mealsError } = await supabase.from("meals").insert(meals).select()

    if (mealsError) {
      console.error("[v0] Error creating meals:", mealsError)
      throw new Error(`Failed to create meals: ${mealsError.message}`)
    }

    return NextResponse.json({
      success: true,
      schedule: {
        date,
        workouts: [workoutData],
        meals: mealsData,
      },
    })
  } catch (error: any) {
    console.error("[v0] Error generating daily schedule:", error)
    return NextResponse.json({ error: error.message || "Failed to generate schedule" }, { status: 500 })
  }
}
