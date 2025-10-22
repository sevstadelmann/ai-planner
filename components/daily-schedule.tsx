"use client"

import { useEffect, useState } from "react"
import { ScheduleCard } from "@/components/schedule-card"
import { WorkoutCard } from "@/components/workout-card"
import { ProductSuggestionCard } from "@/components/product-suggestion-card"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

interface DailyScheduleProps {
  selectedDate: string
}

export function DailySchedule({ selectedDate }: DailyScheduleProps) {
  const [loading, setLoading] = useState(true)
  const [scheduleData, setScheduleData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const fetchSchedule = async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Fetch workouts for the selected date
      const { data: workouts, error: workoutsError } = await supabase
        .from("workouts")
        .select("*")
        .eq("scheduled_date", selectedDate)
        .order("scheduled_time", { ascending: true })

      if (workoutsError && workoutsError.code !== "PGRST116") {
        console.error("[v0] Error fetching workouts:", workoutsError)
      }

      // Fetch meals for the selected date
      const { data: meals, error: mealsError } = await supabase
        .from("meals")
        .select("*")
        .eq("scheduled_date", selectedDate)
        .order("scheduled_time", { ascending: true })

      if (mealsError && mealsError.code !== "PGRST116") {
        console.error("[v0] Error fetching meals:", mealsError)
      }

      const formatExercises = (exercises: any[]): string[] => {
        if (!Array.isArray(exercises)) return []
        return exercises.map((ex) => {
          if (typeof ex === "string") return ex
          const parts = [ex.name || "Exercise"]
          if (ex.sets) parts.push(`${ex.sets} sets`)
          if (ex.reps) parts.push(`${ex.reps} reps`)
          if (ex.weight) parts.push(`${ex.weight}`)
          return parts.join(" - ")
        })
      }

      const formatInstructions = (instructions: any[]): string[] => {
        if (!Array.isArray(instructions)) return []
        return instructions.map((inst) => {
          if (typeof inst === "string") return inst
          if (typeof inst === "object" && inst !== null) {
            return inst.step || inst.instruction || JSON.stringify(inst)
          }
          return String(inst)
        })
      }

      // Combine and sort by time
      const combined = [
        ...(workouts || []).map((w) => ({
          id: w.id,
          time: w.scheduled_time || "00:00",
          type: "workout" as const,
          title: w.title || "Workout",
          description: w.description || "",
          details: w.notes || "",
          location: w.location,
          actionText: "start workout",
          expandedContent: {
            equipment: w.equipment || [],
            duration: w.duration_minutes ? `${w.duration_minutes} minutes` : "Unknown",
            difficulty: (w.intensity || "Medium") as "Easy" | "Medium" | "Hard",
            instructions: formatExercises(w.exercises || []),
          },
        })),
        ...(meals || []).map((m) => ({
          id: m.id,
          time: m.scheduled_time || "00:00",
          type: "meal" as const,
          title: m.meal_type || "Meal",
          description: m.title || "",
          details: m.description || "",
          image: m.image_url,
          actionText: "view recipe",
          expandedContent: {
            ingredients: m.ingredients || [],
            nutrition: {
              calories: m.calories || 0,
              protein: m.protein_g || 0,
              carbs: m.carbs_g || 0,
              fat: m.fat_g || 0,
            },
            instructions: formatInstructions(m.instructions || []),
          },
        })),
      ].sort((a, b) => a.time.localeCompare(b.time))

      setScheduleData(combined)
    } catch (err) {
      console.error("[v0] Error loading schedule:", err)
      setError(err instanceof Error ? err.message : "Failed to load schedule")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedule()
  }, [selectedDate])

  useEffect(() => {
    const handleScheduleGenerated = () => {
      fetchSchedule()
    }

    window.addEventListener("scheduleGenerated", handleScheduleGenerated)
    return () => window.removeEventListener("scheduleGenerated", handleScheduleGenerated)
  }, [selectedDate])

  if (loading) {
    return (
      <div className="px-4 py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-6">
        <div className="text-center text-muted-foreground">
          <p>Error loading schedule: {error}</p>
        </div>
      </div>
    )
  }

  if (scheduleData.length === 0) {
    return (
      <div className="px-4 py-6">
        <div className="text-center text-muted-foreground">
          <p>No schedule for this day yet.</p>
          <p className="text-sm mt-2">Use the AI generator above to create a schedule!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 space-y-4">
      {scheduleData.map((item) => (
        <ScheduleCard key={item.id} {...item} />
      ))}

      <WorkoutCard />
      <ProductSuggestionCard />
    </div>
  )
}
