import { ProfileView } from "@/components/profile-view"
import { Header } from "@/components/header"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-20">
        <ProfileView />
      </main>
      <BottomNavigation />
    </div>
  )
}
