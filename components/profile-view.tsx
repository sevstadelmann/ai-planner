"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { User, Calendar, Target, Utensils, Check, X, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

type UserProfile = {
  name: string
  age: string
  height: string
  weight: string
  goals: string[]
  dietaryRestrictions: string[]
  activityLevel: string
  googleCalendar: boolean
  appleConnected: boolean
}

export function ProfileView() {
  const router = useRouter()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    age: "",
    height: "",
    weight: "",
    goals: [],
    dietaryRestrictions: [],
    activityLevel: "",
    googleCalendar: false,
    appleConnected: false,
  })

  const goalOptions = [
    "Lose Weight",
    "Build Muscle",
    "Improve Fitness",
    "Eat Healthier",
    "Better Sleep",
    "Reduce Stress",
  ]

  const dietaryOptions = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Nut Allergy", "Halal", "Kosher", "None"]

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

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const isAppleUser = user.app_metadata?.provider === "apple"

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()

      if (profileError) {
        console.error("Error loading profile:", profileError)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      }

      const { data: goalsData } = await supabase.from("user_goals").select("*").eq("user_id", user.id)

      const { data: dietaryData } = await supabase.from("dietary_preferences").select("*").eq("user_id", user.id)

      if (profileData) {
        setProfile({
          name: profileData.display_name || profileData.full_name || "",
          age: profileData.age?.toString() || "",
          height: profileData.height_cm?.toString() || "",
          weight: profileData.weight_kg?.toString() || "",
          goals: goalsData?.map((g) => g.goal_type) || [],
          dietaryRestrictions: dietaryData?.map((d) => d.value) || [],
          activityLevel: profileData.activity_level || "",
          googleCalendar: false,
          appleConnected: isAppleUser,
        })
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          display_name: profile.name,
          age: Number.parseInt(profile.age) || null,
          height_cm: Number.parseInt(profile.height) || null,
          weight_kg: Number.parseFloat(profile.weight) || null,
          activity_level: profile.activityLevel || null,
        })
        .eq("id", user.id)

      if (updateError) throw updateError

      await supabase.from("user_goals").delete().eq("user_id", user.id)

      if (profile.goals.length > 0) {
        const { error: goalsError } = await supabase.from("user_goals").insert(
          profile.goals.map((goal) => ({
            user_id: user.id,
            goal_type: goal,
          })),
        )
        if (goalsError) throw goalsError
      }

      await supabase.from("dietary_preferences").delete().eq("user_id", user.id)

      if (profile.dietaryRestrictions.length > 0) {
        const { error: dietError } = await supabase.from("dietary_preferences").insert(
          profile.dietaryRestrictions.map((restriction) => ({
            user_id: user.id,
            preference_type: "restriction",
            value: restriction,
          })),
        )
        if (dietError) throw dietError
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    loadProfile()
    setIsEditing(false)
  }

  const handleAppleSignIn = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error) {
      console.error("Error connecting Apple:", error)
      toast({
        title: "Error",
        description: "Failed to connect Apple account. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Profile</h1>
            <p className="text-muted-foreground">Manage your personal information</p>
          </div>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} className="gap-2 bg-transparent" disabled={saving}>
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2" disabled={saving}>
              <Check className="h-4 w-4" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 p-6 bg-card border border-border rounded-2xl">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-10 w-10 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{profile.name || "User"}</h2>
          <p className="text-muted-foreground">AI Planner Member</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <User className="h-5 w-5" />
          Basic Information
        </h3>

        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={profile.height}
                  onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={profile.weight}
                  onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Age</p>
              <p className="font-medium">{profile.age || "Not set"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Height</p>
              <p className="font-medium">{profile.height ? `${profile.height} cm` : "Not set"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Weight</p>
              <p className="font-medium">{profile.weight ? `${profile.weight} kg` : "Not set"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Activity Level</p>
              <p className="font-medium capitalize">{profile.activityLevel || "Not set"}</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Target className="h-5 w-5" />
          Goals
        </h3>

        {isEditing ? (
          <div className="grid grid-cols-2 gap-3">
            {goalOptions.map((goal) => (
              <button
                key={goal}
                onClick={() => toggleGoal(goal)}
                className={`p-3 rounded-xl border-2 transition-all text-left text-sm ${
                  profile.goals.includes(goal)
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{goal}</span>
                  {profile.goals.includes(goal) && <Check className="h-4 w-4 text-primary" />}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.goals.length > 0 ? (
              profile.goals.map((goal) => (
                <Badge key={goal} variant="secondary">
                  {goal}
                </Badge>
              ))
            ) : (
              <p className="text-muted-foreground">No goals set</p>
            )}
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Utensils className="h-5 w-5" />
          Dietary Preferences
        </h3>

        {isEditing ? (
          <div className="grid grid-cols-2 gap-3">
            {dietaryOptions.map((restriction) => (
              <button
                key={restriction}
                onClick={() => toggleDietary(restriction)}
                className={`p-3 rounded-xl border-2 transition-all text-left text-sm ${
                  profile.dietaryRestrictions.includes(restriction)
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{restriction}</span>
                  {profile.dietaryRestrictions.includes(restriction) && <Check className="h-4 w-4 text-primary" />}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.dietaryRestrictions.length > 0 ? (
              profile.dietaryRestrictions.map((restriction) => (
                <Badge key={restriction} variant="secondary">
                  {restriction}
                </Badge>
              ))
            ) : (
              <p className="text-muted-foreground">No dietary restrictions</p>
            )}
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Integrations
        </h3>

        <div className="flex items-center justify-between p-4 rounded-xl border border-border">
          <div className="flex items-center gap-3">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            <div>
              <p className="font-medium">Apple</p>
              <p className="text-sm text-muted-foreground">{profile.appleConnected ? "Connected" : "Not connected"}</p>
            </div>
          </div>
          {profile.appleConnected ? (
            <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
              Connected
            </Badge>
          ) : (
            <Button size="sm" onClick={handleAppleSignIn}>
              Connect
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-border">
          <div className="flex items-center gap-3">
            <svg className="h-8 w-8" viewBox="0 0 24 24">
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
            <div>
              <p className="font-medium">Google</p>
              <p className="text-sm text-muted-foreground">{profile.googleCalendar ? "Connected" : "Not connected"}</p>
            </div>
          </div>
          {profile.googleCalendar ? (
            <Button variant="outline" size="sm" onClick={() => setProfile({ ...profile, googleCalendar: false })}>
              Disconnect
            </Button>
          ) : (
            <Button size="sm" onClick={() => setProfile({ ...profile, googleCalendar: true })}>
              Connect
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
