"use client"

import type React from "react"
import { useState } from "react"
import { Plus, Calendar, Clock, Tag, MapPin, FileText, Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api/client"
import { useRouter } from "next/navigation"

export function AddEventView() {
  const router = useRouter()
  const [eventType, setEventType] = useState<"meal" | "workout" | "activity" | null>(null)
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [location, setLocation] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useAI, setUseAI] = useState(false)

  const eventTypes = [
    { type: "meal" as const, label: "Meal", color: "bg-green-400", icon: "🍽️" },
    { type: "workout" as const, label: "Workout", color: "bg-blue-400", icon: "💪" },
    { type: "activity" as const, label: "Activity", color: "bg-orange-400", icon: "📅" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (eventType === "meal") {
        await api.createMeal({
          title,
          description: notes,
          meal_type: "lunch", // Default, could be made selectable
          scheduled_date: date,
          scheduled_time: time,
          notes,
        })
      } else if (eventType === "workout") {
        await api.createWorkout({
          title,
          description: notes,
          workout_type: "cardio", // Default, could be made selectable
          scheduled_date: date,
          scheduled_time: time,
          notes,
        })
      }

      // Reset form and navigate back
      setEventType(null)
      setTitle("")
      setDate("")
      setTime("")
      setLocation("")
      setNotes("")
      router.push("/")
    } catch (err: any) {
      setError(err.message || "Failed to create event")
    } finally {
      setLoading(false)
    }
  }

  const handleAIGenerate = async () => {
    if (!eventType || !date) {
      setError("Please select event type and date first")
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (eventType === "meal") {
        const result = await api.generateMeal({
          meal_type: "lunch",
          scheduled_date: date,
          scheduled_time: time || "12:00:00",
        })
        setTitle(result.ai_details.title)
        setNotes(result.ai_details.description)
      } else if (eventType === "workout") {
        const result = await api.generateWorkout({
          scheduled_date: date,
          scheduled_time: time || "07:00:00",
        })
        setTitle(result.ai_details.title)
        setNotes(result.ai_details.description)
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate with AI")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Plus className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-semibold text-foreground">Add New Event</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="bg-card border-border p-4">
          <label className="text-sm font-medium text-foreground mb-3 block">Event Type</label>
          <div className="grid grid-cols-3 gap-3">
            {eventTypes.map((type) => (
              <button
                key={type.type}
                type="button"
                onClick={() => setEventType(type.type)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  eventType === type.type ? "border-accent bg-accent/10" : "border-border hover:border-accent/50"
                }`}
              >
                <div className="text-2xl mb-2">{type.icon}</div>
                <div className="text-xs font-medium text-foreground">{type.label}</div>
              </button>
            ))}
          </div>
        </Card>

        {eventType && eventType !== "activity" && (
          <Button
            type="button"
            variant="outline"
            onClick={handleAIGenerate}
            disabled={loading || !date}
            className="w-full gap-2 bg-transparent"
          >
            <Sparkles className="h-4 w-4" />
            Generate with AI
          </Button>
        )}

        <Card className="bg-card border-border p-4">
          <label className="text-sm font-medium text-foreground mb-2 block">
            <Tag className="h-4 w-4 inline mr-2" />
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Chicken Tikka Masala"
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            required
          />
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-card border-border p-4">
            <label className="text-sm font-medium text-foreground mb-2 block">
              <Calendar className="h-4 w-4 inline mr-2" />
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </Card>

          <Card className="bg-card border-border p-4">
            <label className="text-sm font-medium text-foreground mb-2 block">
              <Clock className="h-4 w-4 inline mr-2" />
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </Card>
        </div>

        <Card className="bg-card border-border p-4">
          <label className="text-sm font-medium text-foreground mb-2 block">
            <MapPin className="h-4 w-4 inline mr-2" />
            Location (Optional)
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Bundespl. 2A"
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </Card>

        <Card className="bg-card border-border p-4">
          <label className="text-sm font-medium text-foreground mb-2 block">
            <FileText className="h-4 w-4 inline mr-2" />
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional details..."
            rows={4}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
          />
        </Card>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-base font-medium"
          disabled={!eventType || !title || !date || !time || loading}
        >
          {loading ? "Creating..." : "Create Event"}
        </Button>
      </form>

      {eventType && (
        <Card className="bg-card border-border p-4 mt-4">
          <h3 className="text-sm font-medium text-foreground mb-3">Preview</h3>
          <div className="flex items-start gap-3">
            <div className={`w-3 h-3 rounded-full ${eventTypes.find((t) => t.type === eventType)?.color} mt-1`} />
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">{title || "Untitled Event"}</div>
              <div className="text-xs text-muted-foreground">
                {date && time ? `${date} at ${time}` : "No date/time set"}
              </div>
              {location && (
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {location}
                </div>
              )}
            </div>
            <Badge variant="outline" className="text-xs">
              {eventType}
            </Badge>
          </div>
        </Card>
      )}
    </div>
  )
}
