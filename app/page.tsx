import { DailySchedule } from "@/components/daily-schedule"
import { Header } from "@/components/header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { AIScheduleGenerator } from "@/components/ai-schedule-generator"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-20">
        <div className="px-4 pt-6">
          <AIScheduleGenerator />
        </div>
        <DailySchedule />
      </main>
      <BottomNavigation />
    </div>
  )
}
