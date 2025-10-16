import { Header } from "@/components/header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { SettingsView } from "@/components/settings-view"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-20">
        <SettingsView />
      </main>
      <BottomNavigation />
    </div>
  )
}
