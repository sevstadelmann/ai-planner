import { Header } from "@/components/header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { FitnessView } from "@/components/fitness-view"

export default function FitnessPage() {
    return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-20">
        <FitnessView />
      </main>
      <BottomNavigation />
    </div>
  )
}
