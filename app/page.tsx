import { DailySchedule } from "@/components/daily-schedule"
import { Header } from "@/components/header"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-20">
        <DailySchedule />
      </main>
      <BottomNavigation />
    </div>
  )
}
