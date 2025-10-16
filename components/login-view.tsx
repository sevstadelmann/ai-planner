"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Mail } from "lucide-react"

export function LoginView() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setNeedsEmailConfirmation(false)

    const supabase = createClient()

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo:
              process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/onboarding`,
          },
        })

        if (error) throw error

        if (data.session) {
          // User is authenticated, redirect to onboarding
          router.push("/onboarding")
        } else if (data.user && !data.session) {
          // User created but needs email confirmation
          setNeedsEmailConfirmation(true)
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        if (data.user) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .maybeSingle()

          if (profileError) {
            console.log("[v0] Profile query error (table might not exist):", profileError.message)
            router.push("/onboarding")
            return
          }

          if (profile && profile.full_name) {
            // Profile is complete, go to home
            router.push("/")
          } else {
            // Profile incomplete or doesn't exist, go to onboarding
            router.push("/onboarding")
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    console.log("[v0] Google sign-in button clicked")
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      console.log("[v0] Supabase client created")

      const redirectUrl = `${window.location.origin}/auth/callback`
      console.log("[v0] Redirect URL:", redirectUrl)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      console.log("[v0] OAuth response:", { data, error })

      if (error) {
        console.error("[v0] OAuth error:", error)
        throw error
      }

      console.log("[v0] OAuth initiated successfully, should redirect to Google")
      // Note: The browser will redirect to Google, so code after this may not execute
    } catch (err: any) {
      console.error("[v0] Google sign-in error:", err)
      setError(err.message || "Failed to sign in with Google")
      setLoading(false)
    }
  }

  const handleAppleSignIn = async () => {
    console.log("[v0] Apple sign-in button clicked")
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      console.log("[v0] Supabase client created for Apple")

      const redirectUrl = `${window.location.origin}/auth/callback`
      console.log("[v0] Redirect URL:", redirectUrl)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: redirectUrl,
        },
      })

      console.log("[v0] Apple OAuth response:", { data, error })

      if (error) {
        console.error("[v0] Apple OAuth error:", error)
        throw error
      }

      console.log("[v0] Apple OAuth initiated successfully")
    } catch (err: any) {
      console.error("[v0] Apple sign-in error:", err)
      setError(err.message || "Failed to sign in with Apple")
      setLoading(false)
    }
  }

  if (needsEmailConfirmation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">AI Planner</h1>
            <p className="mt-2 text-muted-foreground">Your personalized daily companion</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Check your email</h2>
                <p className="text-muted-foreground">
                  We've sent a confirmation link to <strong>{email}</strong>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Click the link in the email to activate your account and continue to onboarding.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => {
                setNeedsEmailConfirmation(false)
                setIsSignUp(false)
              }}
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">AI Planner</h1>
          <p className="mt-2 text-muted-foreground">Your personalized daily companion</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <Button variant={!isSignUp ? "default" : "ghost"} className="flex-1" onClick={() => setIsSignUp(false)}>
              Log In
            </Button>
            <Button variant={isSignUp ? "default" : "ghost"} className="flex-1" onClick={() => setIsSignUp(true)}>
              Sign Up
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              {isSignUp && <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>}
            </div>

            {!isSignUp && (
              <div className="text-right">
                <Button variant="link" className="text-sm p-0 h-auto">
                  Forgot password?
                </Button>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : isSignUp ? "Create Account" : "Log In"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" type="button" onClick={handleGoogleSignIn} disabled={loading}>
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" height="24" viewBox="0 0 24 24" width="24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              <path d="M1 1h22v22H1z" fill="none"/>
            </svg>
              Google
            </Button>
            <Button variant="outline" type="button" onClick={handleAppleSignIn} disabled={loading}>
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Apple
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
