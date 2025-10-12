"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const publicRoutes = ["/login", "/onboarding"]
    const isPublicRoute = publicRoutes.includes(pathname)

    // If it's a public route, don't check auth at all
    if (isPublicRoute) {
      return
    }

    // For protected routes, check authentication
    setIsChecking(true)
    setError(null)

    const checkAuth = async () => {
      try {
        const supabase = createClient()

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Session error:", sessionError)
          router.push("/login")
          return
        }

        if (!session) {
          router.push("/login")
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("height_cm")
          .eq("id", session.user.id)
          .maybeSingle()

        if (profileError) {
          console.error("Profile error:", profileError)
          router.push("/onboarding")
          return
        }

        if (!profile || !profile.height_cm) {
          router.push("/onboarding")
          return
        }
      } catch (err) {
        console.error("Auth check failed:", err)
        setError(err instanceof Error ? err.message : "Authentication failed")
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [pathname, router])

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-destructive text-lg font-semibold">Authentication Error</div>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
