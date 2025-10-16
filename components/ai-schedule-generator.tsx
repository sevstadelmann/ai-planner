"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Calendar, Dumbbell, UtensilsCrossed, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api/client"

export function AIScheduleGenerator() {
  const [loading, setLoading] = useState(false)
  const [scheduleType, setScheduleType] = useState<"daily" | "weekly">("daily")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [daysPerWeek, setDaysPerWeek] = useState("4")
  const { toast } = useToast()

  const handleGenerateSchedule = async () => {
    setLoading(true)

    try {
      let result

      if (scheduleType === "daily") {
        result = await api.generateDailySchedule(selectedDate)

        toast({
          title: "Daily schedule generated!",
          description: `Created ${result.schedule?.workouts?.length || 0} workout(s) and ${result.schedule?.meals?.length || 0} meal(s)`,
        })
      } else {
        result = await api.generateWeeklySchedule(selectedDate, Number.parseInt(daysPerWeek))

        toast({
          title: "Weekly schedule generated!",
          description: `Created schedule for ${result.schedule?.days?.length || 0} days`,
        })
      }

      // Refresh the page to show new schedule
      window.location.reload()
    } catch (error) {
      console.error("Schedule generation error:", error)
      toast({
        title: "Generation failed",
        description:
          error instanceof Error ? error.message : "Failed to generate schedule. Make sure your backend is running.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Schedule Generator
        </CardTitle>
        <CardDescription>
          Let AI create a personalized workout and meal plan based on your goals and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Schedule Type</Label>
          <Select value={scheduleType} onValueChange={(value: "daily" | "weekly") => setScheduleType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Daily Schedule
                </div>
              </SelectItem>
              <SelectItem value="weekly">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Weekly Schedule
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{scheduleType === "daily" ? "Date" : "Start Date"}</Label>
          <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        </div>

        {scheduleType === "weekly" && (
          <div className="space-y-2">
            <Label>Workout Days Per Week</Label>
            <Select value={daysPerWeek} onValueChange={setDaysPerWeek}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 days</SelectItem>
                <SelectItem value="4">4 days</SelectItem>
                <SelectItem value="5">5 days</SelectItem>
                <SelectItem value="6">6 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="pt-2">
          <Button onClick={handleGenerateSchedule} disabled={loading} className="w-full" size="lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating with AI...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate {scheduleType === "daily" ? "Daily" : "Weekly"} Schedule
              </>
            )}
          </Button>
        </div>

        <div className="text-sm text-muted-foreground space-y-1 pt-2">
          <p className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            AI will create personalized workouts based on your fitness level and goals
          </p>
          <p className="flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4" />
            Meals will match your dietary preferences and calorie needs
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
