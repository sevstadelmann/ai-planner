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
    const { start_date, days_per_week = 4 } = body

    if (!start_date) {
      return NextResponse.json({ error: "Start date is required" }, { status: 400 })
    }

    const startDate = new Date(start_date)
    const workouts: any[] = []
    const meals: any[] = []

    // Workout templates for variety
    const workoutTemplates = [
      {
        name: "Upper Body Strength",
        description: "Focus on chest, back, shoulders, and arms",
        duration_minutes: 60,
        exercises: [
          { name: "Bench Press", sets: 4, reps: 8 },
          { name: "Rows", sets: 4, reps: 10 },
          { name: "Shoulder Press", sets: 3, reps: 10 },
          { name: "Bicep Curls", sets: 3, reps: 12 },
        ],
      },
      {
        name: "Lower Body Power",
        description: "Legs and glutes workout",
        duration_minutes: 60,
        exercises: [
          { name: "Squats", sets: 4, reps: 10 },
          { name: "Lunges", sets: 3, reps: 12 },
          { name: "Leg Press", sets: 4, reps: 10 },
          { name: "Calf Raises", sets: 3, reps: 15 },
        ],
      },
      {
        name: "Full Body Circuit",
        description: "High-intensity full body workout",
        duration_minutes: 45,
        exercises: [
          { name: "Burpees", sets: 3, reps: 15 },
          { name: "Kettlebell Swings", sets: 4, reps: 20 },
          { name: "Push-ups", sets: 3, reps: 15 },
          { name: "Mountain Climbers", sets: 3, reps: 20 },
        ],
      },
      {
        name: "Core & Cardio",
        description: "Abs and cardiovascular endurance",
        duration_minutes: 45,
        exercises: [
          { name: "Planks", sets: 3, duration: "60s" },
          { name: "Russian Twists", sets: 3, reps: 20 },
          { name: "Running", duration: "20 minutes" },
          { name: "Bicycle Crunches", sets: 3, reps: 20 },
        ],
      },
    ]

    // Generate workouts for specified days
    for (let i = 0; i < days_per_week; i++) {
      const workoutDate = new Date(startDate)
      workoutDate.setDate(workoutDate.getDate() + i)
      workoutDate.setHours(9, 0, 0, 0)

      const template = workoutTemplates[i % workoutTemplates.length]

      workouts.push({
        user_id: user.id,
        name: template.name,
        description: template.description,
        scheduled_date: workoutDate.toISOString(),
        duration_minutes: template.duration_minutes,
        exercises: template.exercises,
      })
    }

    // Generate meals for all 7 days
    const mealTemplates = {
      breakfast: [
        {
          name: "Protein Pancakes",
          description: "High-protein breakfast with berries",
          calories: 420,
          protein: 32,
          carbs: 45,
          fat: 12,
        },
        {
          name: "Egg White Omelette",
          description: "Veggie-packed omelette with whole grain toast",
          calories: 380,
          protein: 28,
          carbs: 35,
          fat: 14,
        },
        {
          name: "Greek Yogurt Bowl",
          description: "Greek yogurt with granola and fruit",
          calories: 400,
          protein: 30,
          carbs: 48,
          fat: 10,
        },
      ],
      lunch: [
        {
          name: "Chicken Caesar Salad",
          description: "Grilled chicken with romaine and light dressing",
          calories: 520,
          protein: 42,
          carbs: 35,
          fat: 22,
        },
        {
          name: "Turkey Wrap",
          description: "Whole wheat wrap with turkey and veggies",
          calories: 480,
          protein: 38,
          carbs: 45,
          fat: 18,
        },
        {
          name: "Quinoa Buddha Bowl",
          description: "Quinoa with roasted vegetables and tahini",
          calories: 550,
          protein: 35,
          carbs: 55,
          fat: 20,
        },
      ],
      dinner: [
        {
          name: "Grilled Salmon",
          description: "Salmon with asparagus and wild rice",
          calories: 620,
          protein: 48,
          carbs: 52,
          fat: 24,
        },
        {
          name: "Lean Beef Stir-Fry",
          description: "Beef with mixed vegetables and brown rice",
          calories: 580,
          protein: 45,
          carbs: 58,
          fat: 20,
        },
        {
          name: "Chicken Breast Dinner",
          description: "Baked chicken with sweet potato and broccoli",
          calories: 600,
          protein: 50,
          carbs: 55,
          fat: 18,
        },
      ],
    }

    for (let day = 0; day < 7; day++) {
      const mealDate = new Date(startDate)
      mealDate.setDate(mealDate.getDate() + day)

      // Breakfast
      const breakfast = mealTemplates.breakfast[day % mealTemplates.breakfast.length]
      const breakfastDate = new Date(mealDate)
      breakfastDate.setHours(7, 30, 0, 0)
      meals.push({
        user_id: user.id,
        ...breakfast,
        scheduled_date: breakfastDate.toISOString(),
        meal_type: "breakfast",
      })

      // Lunch
      const lunch = mealTemplates.lunch[day % mealTemplates.lunch.length]
      const lunchDate = new Date(mealDate)
      lunchDate.setHours(12, 30, 0, 0)
      meals.push({
        user_id: user.id,
        ...lunch,
        scheduled_date: lunchDate.toISOString(),
        meal_type: "lunch",
      })

      // Dinner
      const dinner = mealTemplates.dinner[day % mealTemplates.dinner.length]
      const dinnerDate = new Date(mealDate)
      dinnerDate.setHours(18, 30, 0, 0)
      meals.push({
        user_id: user.id,
        ...dinner,
        scheduled_date: dinnerDate.toISOString(),
        meal_type: "dinner",
      })
    }

    // Save workouts to database
    const { data: workoutsData, error: workoutsError } = await supabase.from("workouts").insert(workouts).select()

    if (workoutsError) {
      console.error("[v0] Error creating workouts:", workoutsError)
      throw new Error(`Failed to create workouts: ${workoutsError.message}`)
    }

    // Save meals to database
    const { data: mealsData, error: mealsError } = await supabase.from("meals").insert(meals).select()

    if (mealsError) {
      console.error("[v0] Error creating meals:", mealsError)
      throw new Error(`Failed to create meals: ${mealsError.message}`)
    }

    // Organize by days
    const days = []
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startDate)
      dayDate.setDate(dayDate.getDate() + i)
      const dateStr = dayDate.toISOString().split("T")[0]

      days.push({
        date: dateStr,
        workouts: workoutsData?.filter((w) => w.scheduled_date.startsWith(dateStr)) || [],
        meals: mealsData?.filter((m) => m.scheduled_date.startsWith(dateStr)) || [],
      })
    }

    return NextResponse.json({
      success: true,
      schedule: {
        start_date,
        days_per_week,
        days,
      },
    })
  } catch (error: any) {
    console.error("[v0] Error generating weekly schedule:", error)
    return NextResponse.json({ error: error.message || "Failed to generate schedule" }, { status: 500 })
  }
}
