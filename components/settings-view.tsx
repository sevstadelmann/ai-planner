"use client"

import { useState, useEffect } from "react"
import { Settings, Moon, Sun, Bell, User, Shield, Smartphone, Globe, LogOut, Calendar, Check, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/components/theme-provider"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { OAuthDiagnostic } from "@/components/oauth-diagnostic"

export function SettingsView() {
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const [notifications, setNotifications] = useState(true)
  const [autoSync, setAutoSync] = useState(true)
  const [loading, setLoading] = useState(false)
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false)
  const [checkingCalendar, setCheckingCalendar] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    checkGoogleCalendarStatus()
  }, [])

  const checkGoogleCalendarStatus = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase
          .from("external_integrations")
          .select("*")
          .eq("user_id", user.id)
          .eq("provider", "google_calendar")
          .eq("is_active", true)
          .single()

        setGoogleCalendarConnected(!!data)
      }
    } catch (error) {
      console.error("Error checking calendar status:", error)
    } finally {
      setCheckingCalendar(false)
    }
  }

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out?")) {
      setLoading(true)
      try {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push("/login")
      } catch (error) {
        console.error("Error logging out:", error)
      } finally {
        setLoading(false)
      }
    }
  }

  const connectGoogleCalendar = async () => {
    try {
      const supabase = createClient()
      const redirectUrl = `${window.location.origin}/auth/calendar-callback`

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
          scopes: "https://www.googleapis.com/auth/calendar",
          skipBrowserRedirect: false,
        },
      })

      if (error) throw error
    } catch (error) {
      console.error("Error connecting calendar:", error)
      alert("Failed to connect Google Calendar. Please try again.")
    }
  }

  const disconnectGoogleCalendar = async () => {
    if (confirm("Are you sure you want to disconnect Google Calendar?")) {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          await supabase
            .from("external_integrations")
            .update({ is_active: false })
            .eq("user_id", user.id)
            .eq("provider", "google_calendar")

          setGoogleCalendarConnected(false)
        }
      } catch (error) {
        console.error("Error disconnecting calendar:", error)
        alert("Failed to disconnect calendar")
      }
    }
  }

  const syncCalendar = async () => {
    setSyncing(true)
    try {
      const response = await fetch("/api/calendar/sync", {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Successfully synced ${data.synced} events to Google Calendar!`)
      } else {
        throw new Error("Sync failed")
      }
    } catch (error) {
      console.error("Error syncing calendar:", error)
      alert("Failed to sync calendar. Please try again.")
    } finally {
      setSyncing(false)
    }
  }

  const settingsGroups = [
    {
      title: "Appearance",
      icon: theme === "dark" ? Moon : Sun,
      settings: [
        {
          label: "Dark Mode",
          description: "Switch between light and dark themes",
          value: theme === "dark",
          onChange: toggleTheme,
        },
      ],
    },
    {
      title: "Notifications",
      icon: Bell,
      settings: [
        {
          label: "Push Notifications",
          description: "Receive meal and workout reminders",
          value: notifications,
          onChange: setNotifications,
        },
      ],
    },
    {
      title: "Sync & Data",
      icon: Smartphone,
      settings: [
        {
          label: "Auto Sync",
          description: "Automatically sync with fitness trackers",
          value: autoSync,
          onChange: setAutoSync,
        },
      ],
    },
  ]

  const menuItems = [
    {
      icon: User,
      label: "Profile Settings",
      description: "Manage your personal information",
      onClick: () => router.push("/profile"),
    },
    { icon: Shield, label: "Privacy & Security", description: "Control your data and privacy", onClick: () => {} },
    { icon: Globe, label: "Language & Region", description: "Change app language and region", onClick: () => {} },
  ]

  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-semibold text-foreground">Settings</h2>
      </div>

      <div className="space-y-6">
        {settingsGroups.map((group) => (
          <Card key={group.title} className="bg-card border-border p-4">
            <div className="flex items-center gap-3 mb-4">
              <group.icon className="h-4 w-4 text-accent" />
              <h3 className="font-medium text-foreground">{group.title}</h3>
            </div>

            <div className="space-y-4">
              {group.settings.map((setting) => (
                <div key={setting.label} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{setting.label}</div>
                    <div className="text-xs text-muted-foreground">{setting.description}</div>
                  </div>
                  <Switch checked={setting.value} onCheckedChange={setting.onChange} />
                </div>
              ))}
            </div>
          </Card>
        ))}

        <OAuthDiagnostic />

        <Card className="bg-card border-border p-4">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="h-4 w-4 text-accent" />
            <h3 className="font-medium text-foreground">Calendar Integration</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-background">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23s.43 3.45 1.18 4.93l2.85-2.84.81-.62z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground mb-1">Google Calendar</div>
                <div className="text-xs text-muted-foreground mb-3">
                  {checkingCalendar
                    ? "Checking connection..."
                    : googleCalendarConnected
                      ? "Sync your meals and workouts automatically"
                      : "Connect to sync your schedule"}
                </div>
                <div className="flex gap-2">
                  {googleCalendarConnected ? (
                    <>
                      <Button size="sm" onClick={syncCalendar} disabled={syncing}>
                        {syncing ? "Syncing..." : "Sync Now"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={disconnectGoogleCalendar}>
                        <X className="h-3 w-3 mr-1" />
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" onClick={connectGoogleCalendar} disabled={checkingCalendar}>
                      <Check className="h-3 w-3 mr-1" />
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-card border-border p-4">
          <h3 className="font-medium text-foreground mb-4">More Options</h3>
          <div className="space-y-3">
            {menuItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className="w-full justify-start h-auto p-3 text-left"
                onClick={item.onClick}
              >
                <item.icon className="h-4 w-4 text-muted-foreground mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </Card>

        <Card className="bg-card border-border p-4">
          <h3 className="font-medium text-foreground mb-4">Account</h3>
          <Button
            variant="outline"
            className="w-full justify-start h-auto p-3 text-left border-destructive/50 hover:bg-destructive/10 bg-transparent"
            onClick={handleLogout}
            disabled={loading}
          >
            <LogOut className="h-4 w-4 text-destructive mr-3 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium text-destructive">{loading ? "Logging out..." : "Log Out"}</div>
              <div className="text-xs text-muted-foreground">Sign out of your account</div>
            </div>
          </Button>
        </Card>

        <div className="text-center text-xs text-muted-foreground pt-4">
          <p>AI Planner App v1.0.0</p>
        </div>
      </div>
    </div>
  )
}
