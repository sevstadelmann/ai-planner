import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  // In v0/Vercel environment, check multiple sources for env vars
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    (typeof window !== "undefined" && (window as any).__NEXT_PUBLIC_SUPABASE_URL__)

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    (typeof window !== "undefined" && (window as any).__NEXT_PUBLIC_SUPABASE_ANON_KEY__)

  console.log("[v0] Creating Supabase client")
  console.log("[v0] URL available:", !!supabaseUrl)
  console.log("[v0] Key available:", !!supabaseAnonKey)
  console.log("[v0] process.env check:", {
    url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] Supabase environment variables are missing!")
    console.error(
      "[v0] Available env vars:",
      Object.keys(process.env).filter((k) => k.includes("SUPABASE")),
    )

    // Provide a more helpful error message
    const errorMsg = `Supabase configuration missing. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your environment variables.`
    console.error("[v0]", errorMsg)
    throw new Error(errorMsg)
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
