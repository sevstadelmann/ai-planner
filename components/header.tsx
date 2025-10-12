"use client"

import { Bell, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"

export function Header() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {pathname === "/profile"
              ? "Profile"
              : pathname === "/weekly"
                ? "Weekly View"
                : pathname === "/settings"
                  ? "Settings"
                  : pathname === "/add"
                    ? "Add Event"
                    : "Today"}
          </h1>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => router.push("/settings")}>
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => router.push("/profile")}>
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
