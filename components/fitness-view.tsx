"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  Moon,
  Flame,
  Dumbbell,
  Heart,
  Calendar,
  ChevronRight,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"

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

type HealthStats = {
  currentWeight: number
  targetWeight: number
  weeklyWorkouts: number
  targetWorkouts: number
  avgSleepHours: number
  targetSleepHours: number
  caloriesBurned: number
  targetCalories: number
  waterIntake: number
  targetWater: number
}

export function FitnessView() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [timeRange, setTimeRange] = useState<"week" | "month">("week")

  useEffect(() => {
    const storedProfile = localStorage.getItem("userProfile")
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile))
    }
  }, [])

  // Mock health stats - in a real app, this would come from a database
  const healthStats: HealthStats = {
    currentWeight: 72,
    targetWeight: 68,
    weeklyWorkouts: 4,
    targetWorkouts: 5,
    avgSleepHours: 7.2,
    targetSleepHours: 8,
    caloriesBurned: 2450,
    targetCalories: 2800,
    waterIntake: 2.1,
    targetWater: 3.0,
  }

  const weeklyWorkoutData = [
    { day: "Mon", duration: 45, type: "Strength" },
    { day: "Tue", duration: 0, type: null },
    { day: "Wed", duration: 60, type: "Cardio" },
    { day: "Thu", duration: 30, type: "Yoga" },
    { day: "Fri", duration: 50, type: "Strength" },
    { day: "Sat", duration: 0, type: null },
    { day: "Sun", duration: 40, type: "Running" },
  ]

  const sleepData = [
    { day: "Mon", hours: 7.5 },
    { day: "Tue", hours: 6.8 },
    { day: "Wed", hours: 7.2 },
    { day: "Thu", hours: 8.1 },
    { day: "Fri", hours: 6.5 },
    { day: "Sat", hours: 8.5 },
    { day: "Sun", hours: 7.8 },
  ]

  const weightProgress = [
    { week: "Week 1", weight: 75 },
    { week: "Week 2", weight: 74.2 },
    { week: "Week 3", weight: 73.5 },
    { week: "Week 4", weight: 72 },
  ]

  const getGoalProgress = (goal: string) => {
    switch (goal) {
      case "Lose Weight":
        return {
          current: healthStats.currentWeight,
          target: healthStats.targetWeight,
          unit: "kg",
          progress: ((75 - healthStats.currentWeight) / (75 - healthStats.targetWeight)) * 100,
          trend: "down",
        }
      case "Build Muscle":
        return {
          current: healthStats.weeklyWorkouts,
          target: healthStats.targetWorkouts,
          unit: "workouts/week",
          progress: (healthStats.weeklyWorkouts / healthStats.targetWorkouts) * 100,
          trend: "up",
        }
      case "Better Sleep":
        return {
          current: healthStats.avgSleepHours,
          target: healthStats.targetSleepHours,
          unit: "hours/night",
          progress: (healthStats.avgSleepHours / healthStats.targetSleepHours) * 100,
          trend: "up",
        }
      case "Improve Fitness":
        return {
          current: healthStats.caloriesBurned,
          target: healthStats.targetCalories,
          unit: "cal/day",
          progress: (healthStats.caloriesBurned / healthStats.targetCalories) * 100,
          trend: "up",
        }
      default:
        return null
    }
  }

  const maxWorkoutDuration = Math.max(...weeklyWorkoutData.map((d) => d.duration))
  const maxSleepHours = Math.max(...sleepData.map((d) => d.hours))

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Fitness Progress</h1>
          <p className="text-muted-foreground">Track your health journey and achieve your goals</p>
        </div>

        {/* Time Range Toggle */}
        <div className="flex gap-2">
          <Button variant={timeRange === "week" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("week")}>
            This Week
          </Button>
          <Button
            variant={timeRange === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("month")}
          >
            This Month
          </Button>
        </div>

        {/* Goal Progress Cards */}
        {profile?.goals && profile.goals.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Target className="h-5 w-5 text-accent" />
              Your Goals
            </h2>
            {profile.goals.map((goal) => {
              const progress = getGoalProgress(goal)
              if (!progress) return null

              return (
                <Card key={goal} className="p-4 bg-card border-border">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{goal}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {progress.current} / {progress.target} {progress.unit}
                        </p>
                      </div>
                      <Badge variant={progress.progress >= 80 ? "default" : "secondary"} className="gap-1">
                        {progress.trend === "up" ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {Math.round(progress.progress)}%
                      </Badge>
                    </div>
                    <Progress value={progress.progress} className="h-2" />
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Flame className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{healthStats.caloriesBurned}</p>
                <p className="text-xs text-muted-foreground">Calories Burned</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{healthStats.weeklyWorkouts}</p>
                <p className="text-xs text-muted-foreground">Workouts This Week</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Moon className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{healthStats.avgSleepHours}h</p>
                <p className="text-xs text-muted-foreground">Avg Sleep</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <Heart className="h-5 w-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{healthStats.waterIntake}L</p>
                <p className="text-xs text-muted-foreground">Water Intake</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Workout Activity Chart */}
        <Card className="p-4 bg-card border-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-accent" />
              Workout Activity
            </h3>
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              View All
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end h-32 gap-2">
              {weeklyWorkoutData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center h-24">
                    {data.duration > 0 ? (
                      <div
                        className="w-full bg-accent rounded-t-lg transition-all hover:bg-accent/80 relative group"
                        style={{ height: `${(data.duration / maxWorkoutDuration) * 100}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover border border-border rounded px-2 py-1 text-xs whitespace-nowrap">
                          {data.duration}min - {data.type}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-1 bg-muted rounded" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{data.day}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <p className="text-sm text-muted-foreground">Total: 225 minutes</p>
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                +12% vs last week
              </Badge>
            </div>
          </div>
        </Card>

        {/* Sleep Quality Chart */}
        <Card className="p-4 bg-card border-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Moon className="h-5 w-5 text-purple-500" />
              Sleep Quality
            </h3>
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              View All
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end h-32 gap-2">
              {sleepData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center h-24">
                    <div
                      className="w-full bg-purple-500 rounded-t-lg transition-all hover:bg-purple-400 relative group"
                      style={{ height: `${(data.hours / maxSleepHours) * 100}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover border border-border rounded px-2 py-1 text-xs whitespace-nowrap">
                        {data.hours}h
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{data.day}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <p className="text-sm text-muted-foreground">Avg: {healthStats.avgSleepHours}h per night</p>
              <Badge
                variant="secondary"
                className={`gap-1 ${healthStats.avgSleepHours >= healthStats.targetSleepHours ? "bg-green-500/10 text-green-500" : ""}`}
              >
                {healthStats.avgSleepHours >= healthStats.targetSleepHours ? (
                  <>
                    <TrendingUp className="h-3 w-3" />
                    On Track
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3" />
                    Below Target
                  </>
                )}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Weight Progress */}
        {profile?.goals.includes("Lose Weight") && (
          <Card className="p-4 bg-card border-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Target className="h-5 w-5 text-accent" />
                Weight Progress
              </h3>
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View All
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Line Chart Visualization */}
              <div className="relative h-32">
                <div className="absolute inset-0 flex items-end justify-between gap-4">
                  {weightProgress.map((data, index) => {
                    const prevWeight = index > 0 ? weightProgress[index - 1].weight : data.weight
                    const height = ((80 - data.weight) / (80 - 68)) * 100

                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2 relative">
                        <div className="w-full flex items-end justify-center h-24 relative">
                          {/* Line connecting to previous point */}
                          {index > 0 && (
                            <div
                              className="absolute bg-accent"
                              style={{
                                width: "100%",
                                height: "2px",
                                bottom: `${height}%`,
                                left: "-50%",
                                transformOrigin: "right center",
                                transform: `rotate(${Math.atan2((((80 - prevWeight) / (80 - 68)) * 100 - height) * 0.24, 100) * (180 / Math.PI)}deg)`,
                              }}
                            />
                          )}
                          {/* Data point */}
                          <div
                            className="absolute w-3 h-3 bg-accent rounded-full border-2 border-background group cursor-pointer"
                            style={{ bottom: `${height}%` }}
                          >
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover border border-border rounded px-2 py-1 text-xs whitespace-nowrap">
                              {data.weight}kg
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{data.week.replace("Week ", "W")}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Lost {(75 - healthStats.currentWeight).toFixed(1)}kg so far
                </p>
                <Badge variant="default" className="gap-1">
                  <TrendingDown className="h-3 w-3" />
                  {(((75 - healthStats.currentWeight) / (75 - healthStats.targetWeight)) * 100).toFixed(0)}% to goal
                </Badge>
              </div>
            </div>
          </Card>
        )}

        {/* Recent Achievements */}
        <Card className="p-4 bg-card border-border space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-accent" />
            Recent Achievements
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/10">
              <div className="text-2xl">🔥</div>
              <div className="flex-1">
                <p className="font-medium text-sm text-foreground">4-Day Streak</p>
                <p className="text-xs text-muted-foreground">Completed all workouts this week</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/10">
              <div className="text-2xl">😴</div>
              <div className="flex-1">
                <p className="font-medium text-sm text-foreground">Sleep Champion</p>
                <p className="text-xs text-muted-foreground">8+ hours of sleep for 3 nights</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10">
              <div className="text-2xl">💪</div>
              <div className="flex-1">
                <p className="font-medium text-sm text-foreground">Personal Best</p>
                <p className="text-xs text-muted-foreground">New record: Leg Press 180kg</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
