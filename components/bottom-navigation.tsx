"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Calendar, Activity, Settings, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BottomNavigation() {
  const pathname = usePathname()

  const navItems = [
    { icon: Home, label: "Home", href: "/", active: pathname === "/" },
    { icon: Calendar, label: "Weekly", href: "/weekly", active: pathname === "/weekly" },
    { icon: Plus, label: "Add", href: "/add", active: pathname === "/add", isAction: true },
    { icon: Activity, label: "Fitness", href: "/fitness", active: pathname === "/fitness" },
    { icon: Settings, label: "Settings", href: "/settings", active: pathname === "/settings" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-md border-t border-border">
      <div className="flex items-center justify-around px-4 py-2">
        {navItems.map((item, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            asChild
            className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
              item.active
                ? "text-accent"
                : item.isAction
                  ? "bg-accent text-accent-foreground hover:bg-accent/90"
                  : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Link href={item.href}>
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          </Button>
        ))}
      </div>
    </nav>
  )
}
