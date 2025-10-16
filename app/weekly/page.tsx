import { Header } from "@/components/header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { WeeklyView } from "@/components/weekly-view"

export default function WeeklyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-20">
        <WeeklyView />
      </main>
      <BottomNavigation />
    </div>
  )
}
