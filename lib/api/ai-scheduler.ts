// API client for AI-powered schedule generation

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface DailyScheduleRequest {
  date: string // ISO date string
}

export interface WeeklyScheduleRequest {
  start_date: string // ISO date string
  days_per_week?: number
}

export interface WorkoutGenerationRequest {
  workout_type?: string
  duration_minutes?: number
  intensity?: string
  focus_areas?: string[]
  equipment?: string[]
}

export interface MealGenerationRequest {
  meal_type: "breakfast" | "lunch" | "dinner" | "snack"
  cuisine?: string
  max_time?: number
  dietary_focus?: string
}

// Generate complete daily schedule (workout + all meals)
export async function generateDailySchedule(token: string, date: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/scheduler/daily`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ date }),
  })

  if (!response.ok) {
    throw new Error("Failed to generate daily schedule")
  }

  return response.json()
}

// Generate complete weekly schedule
export async function generateWeeklySchedule(token: string, startDate: string, daysPerWeek = 4): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/scheduler/weekly`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      start_date: startDate,
      days_per_week: daysPerWeek,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to generate weekly schedule")
  }

  return response.json()
}

// Generate single AI workout
export async function generateAIWorkout(token: string, preferences: WorkoutGenerationRequest): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/ai/workouts/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(preferences),
  })

  if (!response.ok) {
    throw new Error("Failed to generate workout")
  }

  return response.json()
}

// Generate and save AI workout
export async function generateAndSaveWorkout(
  token: string,
  preferences: WorkoutGenerationRequest,
  scheduledDate: string,
  scheduledTime?: string,
): Promise<any> {
  const response = await fetch(
    `${API_BASE_URL}/api/ai/workouts/generate-and-save?scheduled_date=${scheduledDate}${scheduledTime ? `&scheduled_time=${scheduledTime}` : ""}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(preferences),
    },
  )

  if (!response.ok) {
    throw new Error("Failed to generate and save workout")
  }

  return response.json()
}

// Generate single AI meal
export async function generateAIMeal(token: string, request: MealGenerationRequest): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/ai/meals/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error("Failed to generate meal")
  }

  return response.json()
}

// Generate and save AI meal
export async function generateAndSaveMeal(
  token: string,
  request: MealGenerationRequest,
  scheduledDate: string,
  scheduledTime?: string,
): Promise<any> {
  const response = await fetch(
    `${API_BASE_URL}/api/ai/meals/generate-and-save?scheduled_date=${scheduledDate}${scheduledTime ? `&scheduled_time=${scheduledTime}` : ""}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    },
  )

  if (!response.ok) {
    throw new Error("Failed to generate and save meal")
  }

  return response.json()
}

// Generate daily meal plan (all meals for one day)
export async function generateDailyMealPlan(token: string, date: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/ai/meals/daily-plan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ date }),
  })

  if (!response.ok) {
    throw new Error("Failed to generate daily meal plan")
  }

  return response.json()
}

// Generate weekly workout plan
export async function generateWeeklyWorkoutPlan(token: string, startDate: string, daysPerWeek = 4): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/ai/workouts/weekly-plan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      start_date: startDate,
      days_per_week: daysPerWeek,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to generate weekly workout plan")
  }

  return response.json()
}
