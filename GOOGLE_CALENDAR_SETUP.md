# Google Calendar Integration Setup

This guide will help you set up Google Calendar integration for the AI Planner App.

## Prerequisites

- A Google Cloud Platform account
- Access to the Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "AI Planner App"
4. Click "Create"

## Step 2: Enable Google Calendar API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google Calendar API"
3. Click on it and press "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External
   - App name: AI Planner App
   - User support email: Your email
   - Developer contact: Your email
   - Add scopes: `https://www.googleapis.com/auth/calendar` and `https://www.googleapis.com/auth/calendar.events`
   - Add test users (your email) if in testing mode
4. Create OAuth client ID:
   - Application type: Web application
   - Name: AI Planner Web Client
   - Authorized redirect URIs:
     - For development: `http://localhost:3000/api/auth/google/callback`
     - For production: `https://your-domain.com/api/auth/google/callback`
5. Click "Create"
6. Copy the Client ID and Client Secret

## Step 4: Add Environment Variables

Add these environment variables to your Vercel project or `.env.local` file:

\`\`\`bash
GOOGLE_CLIENT_ID=1011319456671-fb7o669jkhe8dukgpurv8ukfc82hog0c.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
NEXT_PUBLIC_API_URL=https://difabskwzjbhjiwpdldb.supabase.co  # or your production URL
\`\`\`

### In Vercel:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the three variables above
4. Redeploy your application

## Step 5: Test the Integration

1. Sign up or log in to the app
2. Go to Settings → Calendar Integration
3. Click "Connect" on Google Calendar
4. Authorize the app to access your Google Calendar
5. Once connected, click "Sync Now" to sync your workouts and meals

## Features

Once connected, the app will:

- Sync your scheduled workouts to Google Calendar (marked with 🏋️)
- Sync your meal plans to Google Calendar (marked with 🍽️)
- Automatically refresh tokens when they expire
- Allow manual sync from the Settings page

## Troubleshooting

### "Google OAuth not configured" error
- Make sure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in your environment variables
- Restart your development server after adding environment variables

### "Failed to exchange code for tokens" error
- Verify your redirect URI matches exactly what's configured in Google Cloud Console
- Check that the Google Calendar API is enabled

### "Not authenticated" error
- Make sure you're logged in to the app
- Try logging out and logging back in

## Security Notes

- Never commit your `.env.local` file to version control
- Keep your Client Secret secure
- Use different OAuth credentials for development and production
- Regularly rotate your credentials
- Review the OAuth consent screen settings to ensure minimal scope access

## API Rate Limits

Google Calendar API has the following limits:
- 1,000,000 queries per day
- 10 queries per second per user

The app automatically handles token refresh and respects these limits.
