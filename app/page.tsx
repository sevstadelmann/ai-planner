"use client"

import { useState } from "react"
import { DailySchedule } from "@/components/daily-schedule"
import { Header } from "@/components/header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { AIScheduleGenerator } from "@/components/ai-schedule-generator"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])

  const handlePreviousDay = () => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() - 1)
    setSelectedDate(date.toISOString().split("T")[0])
  }

  const handleNextDay = () => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() + 1)
    setSelectedDate(date.toISOString().split("T")[0])
  }

  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    }

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-20">
        <div className="px-4 pt-6">
          <AIScheduleGenerator selectedDate={selectedDate} onDateChange={setSelectedDate} />
        </div>

        <div className="px-4 pt-6 pb-2">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={handlePreviousDay}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold">{formatDisplayDate(selectedDate)}</h2>
            <Button variant="ghost" size="icon" onClick={handleNextDay}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <DailySchedule selectedDate={selectedDate} />
      </main>
      <BottomNavigation />
    </div>
  )
}
