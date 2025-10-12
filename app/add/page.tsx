import { Header } from "@/components/header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { AddEventView } from "@/components/add-event-view"

export default function AddPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <AddEventView />
      <BottomNavigation />
    </div>
  )
}
