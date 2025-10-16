"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Calendar, RefreshCw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { AIScheduleGenerator } from "@/components/ai-schedule-generator"

export function WeeklyView() {
  const [currentStartDate, setCurrentStartDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [scheduleData, setScheduleData] = useState<Record<string, any[]>>({})
  const [summary, setSummary] = useState({ totalWorkouts: 0, totalMeals: 0, totalEvents: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isCalendarConnected, setIsCalendarConnected] = useState(false)
  const [isCheckingConnection, setIsCheckingConnection] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  const checkCalendarConnection = async () => {
    setIsCheckingConnection(true)
    try {
      const response = await fetch("/api/calendar/status")
      if (!response.ok) throw new Error("Failed to check calendar status")

      const data = await response.json()
      setIsCalendarConnected(data.connected)
    } catch (error) {
      console.error("[v0] Error checking calendar connection:", error)
      setIsCalendarConnected(false)
    } finally {
      setIsCheckingConnection(false)
    }
  }

  const fetchSchedule = async (startDate: Date) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/schedule/weekly?startDate=${startDate.toISOString()}`)
      if (!response.ok) throw new Error("Failed to fetch schedule")

      const data = await response.json()
      setScheduleData(data.schedule || {})
      setSummary(data.summary || { totalWorkouts: 0, totalMeals: 0, totalEvents: 0 })
    } catch (error) {
      console.error("[v0] Error fetching schedule:", error)
      toast({
        title: "Error",
        description: "Failed to load weekly schedule",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSyncCalendar = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch("/api/calendar/sync", { method: "POST" })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync calendar")
      }

      toast({
        title: "Calendar synced",
        description: `Successfully synced ${data.synced} events to Google Calendar`,
      })
    } catch (error: any) {
      console.error("[v0] Error syncing calendar:", error)
      toast({
        title: "Sync failed",
        description: error.message || "Failed to sync with Google Calendar",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleConnectCalendar = () => {
    router.push("/settings")
    toast({
      title: "Connect Google Calendar",
      description: "Go to Settings to connect your Google Calendar",
    })
  }

  useEffect(() => {
    checkCalendarConnection()
    fetchSchedule(currentStartDate)
  }, [currentStartDate])

  const goToPreviousWeek = () => {
    const newDate = new Date(currentStartDate)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentStartDate(newDate)
    setSelectedDay(null)
  }

  const goToNextWeek = () => {
    const newDate = new Date(currentStartDate)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentStartDate(newDate)
    setSelectedDay(null)
  }

  const goToCurrentWeek = () => {
    setCurrentStartDate(new Date())
    setSelectedDay(null)
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentStartDate)
    date.setDate(date.getDate() + i)
    return date
  })

  const formatWeekRange = () => {
    const start = weekDays[0]
    const end = weekDays[6]
    const startMonth = start.toLocaleDateString("en-US", { month: "short" })
    const endMonth = end.toLocaleDateString("en-US", { month: "short" })
    const year = start.getFullYear()

    if (startMonth === endMonth) {
      return `${startMonth} ${start.getDate()}-${end.getDate()}, ${year}`
    }
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${year}`
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <AIScheduleGenerator />
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center justify-center h-15">
          <Button variant="ghost" size="sm" onClick={goToPreviousWeek} disabled={isLoading}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToCurrentWeek}
            disabled={isLoading}
            className="text-sm font-medium px-0"
          >
            {formatWeekRange()}
          </Button>
          <Button variant="ghost" size="sm" onClick={goToNextWeek} disabled={isLoading}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-0">
          {isCheckingConnection ? (
            <Button variant="outline" size="sm" disabled className="ml-2 bg-transparent">
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          ) : isCalendarConnected ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncCalendar}
              disabled={isSyncing}
              className="ml-2 bg-transparent"
            >
              {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="ml-2">Sync</span>
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleConnectCalendar} className="ml-2 bg-transparent">
              <Calendar className="h-4 w-4" />
              <span className="ml-2">Connect</span>
            </Button>
          )}
        </div>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : (
        <div className="space-y-3">
          {weekDays.map((date, index) => {
            const dateKey = date.toISOString().split("T")[0]
            const dayEvents = scheduleData[dateKey] || []
            const isExpanded = selectedDay === index
            const isTodayDate = isToday(date)

            return (
              <Card
                key={dateKey}
                className={`bg-card border-border overflow-hidden ${isTodayDate ? "ring-2 ring-accent" : ""}`}
              >
                <button
                  onClick={() => setSelectedDay(isExpanded ? null : index)}
                  className="w-full p-4 flex items-center justify-between hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground uppercase">
                        {date.toLocaleDateString("en-US", { weekday: "short" })}
                      </div>
                      <div className={`text-2xl font-bold ${isTodayDate ? "text-accent" : "text-foreground"}`}>
                        {date.getDate()}
                      </div>
                      {isTodayDate && <div className="text-xs text-accent font-medium">Today</div>}
                    </div>
                    <div className="flex gap-2">
                      {dayEvents.slice(0, 3).map((event, eventIndex) => (
                        <div key={eventIndex} className={`w-2 h-2 rounded-full ${event.color}`} />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{dayEvents.length - 3}</span>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {dayEvents.length} {dayEvents.length === 1 ? "event" : "events"}
                  </Badge>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                    {dayEvents.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No events scheduled for this day</p>
                    ) : (
                      dayEvents.map((event, eventIndex) => (
                        <div key={eventIndex} className="flex items-start gap-3">
                          <div className={`w-3 h-3 rounded-full ${event.color} mt-1 flex-shrink-0`} />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-foreground">{event.title}</div>
                            {event.description && (
                              <div className="text-xs text-muted-foreground">{event.description}</div>
                            )}
                            <div className="text-xs text-muted-foreground mt-1">
                              {event.time}
                              {event.duration && ` • ${event.duration} min`}
                              {event.calories && ` • ${event.calories} cal`}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs capitalize">
                            {event.type}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-sm font-medium text-foreground mb-3">Week Summary</h3>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {summary.totalMeals} {summary.totalMeals === 1 ? "meal" : "meals"} planned
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {summary.totalWorkouts} {summary.totalWorkouts === 1 ? "workout" : "workouts"} scheduled
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {summary.totalEvents} total {summary.totalEvents === 1 ? "event" : "events"}
          </Badge>
        </div>
      </div>
    </div>
  )
}
