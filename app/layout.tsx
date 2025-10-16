import type React from "react"
import type { Metadata } from "next"
import { Inter, Roboto_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import { Suspense } from "react"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "AI Planner App",
  description: "Your personalized AI-powered calendar and planner",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Suspense fallback={null}>
          <ThemeProvider>{children}</ThemeProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
