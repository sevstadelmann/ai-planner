import { createClient } from "@/lib/supabase/client"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

async function getAuthHeaders() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error("Not authenticated")
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  }
}

export const api = {
  // Profile
  async getProfile() {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/api/profile/me`, { headers })
    if (!response.ok) throw new Error("Failed to fetch profile")
    return response.json()
  },

  async updateProfile(data: any) {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/api/profile/me`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to update profile")
    return response.json()
  },

  async getGoals() {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/api/profile/goals`, { headers })
    if (!response.ok) throw new Error("Failed to fetch goals")
    return response.json()
  },

  async createGoal(data: any) {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/api/profile/goals`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to create goal")
    return response.json()
  },

  // Workouts
  async getWorkouts(startDate?: string, endDate?: string) {
    const headers = await getAuthHeaders()
    const params = new URLSearchParams()
    if (startDate) params.append("start_date", startDate)
    if (endDate) params.append("end_date", endDate)

    const response = await fetch(`${API_BASE_URL}/api/workouts?${params}`, { headers })
    if (!response.ok) throw new Error("Failed to fetch workouts")
    return response.json()
  },

  async createWorkout(data: any) {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/api/workouts`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to create workout")
    return response.json()
  },

  async updateWorkout(id: string, data: any) {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/api/workouts/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to update workout")
    return response.json()
  },

  // Meals
  async getMeals(startDate?: string, endDate?: string) {
    const headers = await getAuthHeaders()
    const params = new URLSearchParams()
    if (startDate) params.append("start_date", startDate)
    if (endDate) params.append("end_date", endDate)

    const response = await fetch(`${API_BASE_URL}/api/meals?${params}`, { headers })
    if (!response.ok) throw new Error("Failed to fetch meals")
    return response.json()
  },

  async createMeal(data: any) {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/api/meals`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to create meal")
    return response.json()
  },

  // AI Generation
  async generateWorkout(data: any) {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/api/ai/workouts/generate-and-save`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to generate workout")
    return response.json()
  },

  async generateMeal(data: any) {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/api/ai/meals/generate-and-save`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to generate meal")
    return response.json()
  },

  // Scheduler
  async generateDailySchedule(date: string) {
    const headers = await getAuthHeaders()
    const response = await fetch(`/api/scheduler/daily`, {
      method: "POST",
      headers,
      body: JSON.stringify({ date }),
    })
    if (!response.ok) throw new Error("Failed to generate daily schedule")
    return response.json()
  },

  async generateWeeklySchedule(startDate: string, daysPerWeek = 4) {
    const headers = await getAuthHeaders()
    const response = await fetch(`/api/scheduler/weekly`, {
      method: "POST",
      headers,
      body: JSON.stringify({ start_date: startDate, days_per_week: daysPerWeek }),
    })
    if (!response.ok) throw new Error("Failed to generate weekly schedule")
    return response.json()
  },

  async getSchedule(startDate: string, endDate: string) {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/api/scheduler/get`, {
      method: "POST",
      headers,
      body: JSON.stringify({ start_date: startDate, end_date: endDate }),
    })
    if (!response.ok) throw new Error("Failed to get schedule")
    return response.json()
  },

  // Health Tracking
  async trackSleep(data: any) {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/api/health/sleep`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to track sleep")
    return response.json()
  },

  async getSleepData(startDate?: string, endDate?: string) {
    const headers = await getAuthHeaders()
    const params = new URLSearchParams()
    if (startDate) params.append("start_date", startDate)
    if (endDate) params.append("end_date", endDate)

    const response = await fetch(`${API_BASE_URL}/api/health/sleep?${params}`, { headers })
    if (!response.ok) throw new Error("Failed to fetch sleep data")
    return response.json()
  },

  async trackWeight(data: any) {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/api/health/weight`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to track weight")
    return response.json()
  },

  async getWeightData(startDate?: string, endDate?: string) {
    const headers = await getAuthHeaders()
    const params = new URLSearchParams()
    if (startDate) params.append("start_date", startDate)
    if (endDate) params.append("end_date", endDate)

    const response = await fetch(`${API_BASE_URL}/api/health/weight?${params}`, { headers })
    if (!response.ok) throw new Error("Failed to fetch weight data")
    return response.json()
  },

  // Strava
  async connectStrava(redirectUri: string) {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/api/strava/connect`, {
      method: "POST",
      headers,
      body: JSON.stringify({ redirect_uri: redirectUri }),
    })
    if (!response.ok) throw new Error("Failed to connect Strava")
    return response.json()
  },

  async stravaCallback(code: string) {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/api/strava/callback`, {
      method: "POST",
      headers,
      body: JSON.stringify({ code }),
    })
    if (!response.ok) throw new Error("Failed to complete Strava connection")
    return response.json()
  },

  async syncStravaActivities(days = 7) {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/api/strava/sync`, {
      method: "POST",
      headers,
      body: JSON.stringify({ days }),
    })
    if (!response.ok) throw new Error("Failed to sync Strava activities")
    return response.json()
  },
}
