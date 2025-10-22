"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Check, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

type UserProfile = {
  name: string
  age: string
  height: string
  weight: string
  goals: string[]
  dietaryRestrictions: string[]
  activityLevel: string
  googleCalendar: boolean
}

export function OnboardingView() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [calendarConnected, setCalendarConnected] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    age: "",
    height: "",
    weight: "",
    goals: [],
    dietaryRestrictions: [],
    activityLevel: "",
    googleCalendar: false,
  })

  const totalSteps = 4

  const goalOptions = [
    "Lose Weight",
    "Build Muscle",
    "Improve Fitness",
    "Eat Healthier",
    "Better Sleep",
    "Reduce Stress",
  ]

  const dietaryOptions = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Nut Allergy", "Halal", "Kosher", "None"]

  const activityLevels = [
    { value: "sedentary", label: "Sedentary", desc: "Little to no exercise" },
    { value: "light", label: "Lightly Active", desc: "Exercise 1-3 days/week" },
    { value: "moderate", label: "Moderately Active", desc: "Exercise 3-5 days/week" },
    { value: "very", label: "Very Active", desc: "Exercise 6-7 days/week" },
    { value: "extra", label: "Extra Active", desc: "Physical job + exercise" },
  ]

  const toggleGoal = (goal: string) => {
    setProfile((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal) ? prev.goals.filter((g) => g !== goal) : [...prev.goals, goal],
    }))
  }

  const toggleDietary = (restriction: string) => {
    setProfile((prev) => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
        ? prev.dietaryRestrictions.filter((r) => r !== restriction)
        : [...prev.dietaryRestrictions, restriction],
    }))
  }

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      if (!isAuthenticated) {
        toast({
          title: "Authentication Required",
          description: "Please log in with Google to save your profile",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      setLoading(true)

      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          throw new Error("Not authenticated")
        }

        const { error: profileError } = await supabase.from("profiles").upsert(
          {
            id: user.id,
            email: user.email || "",
            full_name: profile.name || null,
            age: profile.age ? Number.parseInt(profile.age) : null,
            height_cm: profile.height ? Number.parseInt(profile.height) : null,
            weight_kg: profile.weight ? Number.parseFloat(profile.weight) : null,
            activity_level: profile.activityLevel || null,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "id",
          },
        )

        if (profileError) {
          console.error("[v0] Profile upsert error:", profileError)

          if (profileError.message.includes("relation") || profileError.message.includes("does not exist")) {
            throw new Error("Database not set up. Please run the setup script in Supabase SQL Editor first.")
          }

          throw new Error(`Failed to create profile: ${profileError.message}`)
        }

        if (profile.goals.length > 0) {
          const { error: goalError } = await supabase.from("user_goals").insert(
            profile.goals.map((goal) => ({
              user_id: user.id,
              goal_type: goal,
            })),
          )
          if (goalError) {
            console.error("[v0] Goal insert error:", goalError.message)
          }
        }

        const validRestrictions = profile.dietaryRestrictions.filter((r) => r !== "None")
        if (validRestrictions.length > 0) {
          const { error: dietError } = await supabase.from("dietary_preferences").insert(
            validRestrictions.map((restriction) => ({
              user_id: user.id,
              preference_type: "restriction",
              value: restriction,
            })),
          )
          if (dietError) {
            console.error("[v0] Dietary preference insert error:", dietError.message)
          }
        }

        toast({
          title: "Welcome!",
          description: "Your profile has been set up successfully",
        })
        router.push("/")
      } catch (err: any) {
        console.error("[v0] Onboarding error:", err)
        toast({
          title: "Error",
          description: err.message || "Failed to save profile. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const connectGoogleCalendar = async () => {
    try {
      const supabase = createClient()
      const redirectUrl = `${window.location.origin}/onboarding?connected=true`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
          scopes: "https://www.googleapis.com/auth/calendar",
          skipBrowserRedirect: false,
        },
      })

      if (error) throw error
    } catch (error) {
      console.error("Error connecting calendar:", error)
      toast({
        title: "Error",
        description: "Failed to connect Google Calendar. Please try again.",
        variant: "destructive",
      })
    }
  }

  const checkCalendarConnection = async () => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("connected") === "true") {
      setCalendarConnected(true)
      setProfile((prev) => ({ ...prev, googleCalendar: true }))
      window.history.replaceState({}, "", window.location.pathname)
    }

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: integration } = await supabase
        .from("external_integrations")
        .select("*")
        .eq("user_id", user.id)
        .eq("provider", "google_calendar")
        .eq("is_active", true)
        .maybeSingle()

      if (integration) {
        setCalendarConnected(true)
        setProfile((prev) => ({ ...prev, googleCalendar: true }))
      }
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
    }
    checkAuth()
    checkCalendarConnection()
  }, [])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {isAuthenticated === false && (
          <Alert className="mb-4 border-amber-500/50 bg-amber-500/10">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-600 dark:text-amber-400">
              You're not logged in. You can preview the onboarding flow, but you'll need to{" "}
              <button
                onClick={() => router.push("/login")}
                className="underline font-medium hover:text-amber-700 dark:hover:text-amber-300"
              >
                log in with Google
              </button>{" "}
              to save your profile.
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Step {step} of {totalSteps}
            </span>
            <span className="text-sm text-muted-foreground">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Let's get to know you</h2>
                <p className="text-muted-foreground">Tell us about yourself so we can personalize your experience</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="25"
                      value={profile.age}
                      onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="175"
                      value={profile.height}
                      onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="70"
                    value={profile.weight}
                    onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">What are your goals?</h2>
                <p className="text-muted-foreground">Select all that apply. We'll help you achieve them!</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {goalOptions.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      profile.goals.includes(goal)
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{goal}</span>
                      {profile.goals.includes(goal) && <Check className="h-5 w-5 text-primary" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Dietary preferences</h2>
                <p className="text-muted-foreground">Help us suggest meals that fit your lifestyle</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {dietaryOptions.map((restriction) => (
                    <button
                      key={restriction}
                      onClick={() => toggleDietary(restriction)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        profile.dietaryRestrictions.includes(restriction)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{restriction}</span>
                        {profile.dietaryRestrictions.includes(restriction) && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Activity Level</Label>
                  <div className="space-y-2">
                    {activityLevels.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => setProfile({ ...profile, activityLevel: level.value })}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          profile.activityLevel === level.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{level.label}</div>
                            <div className="text-sm text-muted-foreground">{level.desc}</div>
                          </div>
                          {profile.activityLevel === level.value && <Check className="h-5 w-5 text-primary" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Connect your calendar</h2>
                <p className="text-muted-foreground">
                  Sync with Google Calendar to automatically schedule your activities
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-6 rounded-xl border-2 border-border bg-muted/30">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-background">
                      <svg className="h-6 w-6" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">Google Calendar</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Automatically sync your meals, workouts, and activities
                      </p>
                      {calendarConnected ? (
                        <Badge variant="default" className="gap-1">
                          <Check className="h-3 w-3" />
                          Connected
                        </Badge>
                      ) : (
                        <Button onClick={connectGoogleCalendar} size="sm">
                          Connect Calendar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <p className="text-sm text-muted-foreground">
                    You can always connect or disconnect your calendar later in settings
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} className="gap-2 bg-transparent" disabled={loading}>
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1 gap-2" disabled={loading}>
              {loading ? "Saving..." : step === totalSteps ? "Complete Setup" : "Continue"}
              {step < totalSteps && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
