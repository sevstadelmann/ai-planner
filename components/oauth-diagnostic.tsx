"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, AlertCircle, ExternalLink } from "lucide-react"

export function OAuthDiagnostic() {
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runDiagnostics = async () => {
    setLoading(true)
    const results: any = {
      checks: [],
      recommendations: [],
    }

    // Check 1: Supabase URL and Key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    results.checks.push({
      name: "Supabase Configuration",
      status: supabaseUrl && supabaseKey ? "pass" : "fail",
      message:
        supabaseUrl && supabaseKey
          ? "Supabase environment variables are configured"
          : "Missing Supabase environment variables",
    })

    // Check 2: Google OAuth Credentials
    const googleClientId = process.env.GOOGLE_CLIENT_ID
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

    results.checks.push({
      name: "Google OAuth Credentials",
      status: googleClientId && googleClientSecret ? "pass" : "fail",
      message:
        googleClientId && googleClientSecret
          ? "Google OAuth credentials are configured"
          : "Missing Google OAuth credentials (GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET)",
    })

    // Check 3: Expected Redirect URI
    const expectedRedirectUri = `${supabaseUrl}/auth/v1/callback`
    results.checks.push({
      name: "Supabase Redirect URI",
      status: "info",
      message: `Your redirect URI should be: ${expectedRedirectUri}`,
    })

    // Add recommendations based on the "This content is blocked" error
    results.recommendations = [
      {
        title: "Step 1: Verify OAuth Consent Screen Configuration",
        steps: [
          "Go to Google Cloud Console > APIs & Services > OAuth consent screen",
          "Check if the status is 'Testing' or 'In Production'",
          "If 'Testing', you MUST add your email as a test user",
        ],
      },
      {
        title: "Step 2: Add Test Users (Required for Testing Mode)",
        steps: [
          "In OAuth consent screen, scroll to 'Test users' section",
          "Click 'ADD USERS'",
          "Enter your exact email address (the one you're signing in with)",
          "Click 'SAVE'",
          "Wait 5-10 minutes for changes to propagate",
        ],
      },
      {
        title: "Step 3: Verify Redirect URI in Google Cloud Console",
        steps: [
          "Go to APIs & Services > Credentials",
          "Click on your OAuth 2.0 Client ID",
          `Under 'Authorized redirect URIs', add: ${expectedRedirectUri}`,
          "Click 'SAVE'",
        ],
      },
      {
        title: "Step 4: Enable Google OAuth in Supabase",
        steps: [
          "Go to your Supabase project dashboard",
          "Navigate to Authentication > Providers",
          "Find 'Google' and enable it",
          "Add your Google Client ID and Client Secret",
          "Save the configuration",
        ],
      },
      {
        title: "Alternative: Publish Your App (Removes Testing Restrictions)",
        steps: [
          "In OAuth consent screen, click 'PUBLISH APP'",
          "This removes the 100 test user limit",
          "Note: Apps with sensitive scopes may require Google verification (takes days)",
        ],
      },
    ]

    setDiagnostics(results)
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Google OAuth Diagnostics</CardTitle>
        <CardDescription>Troubleshoot the "This content is blocked" error</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runDiagnostics} disabled={loading}>
          {loading ? "Running Diagnostics..." : "Run Diagnostics"}
        </Button>

        {diagnostics && (
          <div className="space-y-6">
            {/* Configuration Checks */}
            <div className="space-y-2">
              <h3 className="font-semibold">Configuration Status</h3>
              {diagnostics.checks.map((check: any, index: number) => (
                <div key={index} className="flex items-start gap-2 p-3 rounded-lg border">
                  {check.status === "pass" && <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />}
                  {check.status === "fail" && <XCircle className="h-5 w-5 text-red-500 mt-0.5" />}
                  {check.status === "info" && <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />}
                  <div className="flex-1">
                    <p className="font-medium">{check.name}</p>
                    <p className="text-sm text-muted-foreground">{check.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            <div className="space-y-4">
              <h3 className="font-semibold">Fix "This content is blocked" Error</h3>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This error occurs when your Google OAuth consent screen is in Testing mode and your email is not added
                  as a test user. Follow these steps to fix it:
                </AlertDescription>
              </Alert>

              {diagnostics.recommendations.map((rec: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-base">{rec.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      {rec.steps.map((step: string, stepIndex: number) => (
                        <li key={stepIndex} className="text-muted-foreground">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Links */}
            <div className="space-y-2">
              <h3 className="font-semibold">Quick Links</h3>
              <div className="flex flex-col gap-2">
                <Button variant="outline" asChild>
                  <a
                    href="https://console.cloud.google.com/apis/credentials/consent"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    OAuth Consent Screen
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    Google Cloud Credentials
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a
                    href={`https://supabase.com/dashboard/project/${process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1]?.split(".")[0]}/auth/providers`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    Supabase Auth Providers
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
