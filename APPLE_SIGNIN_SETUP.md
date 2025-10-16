# Apple Sign-In Setup Guide

This guide explains how to configure Apple Sign-In for your AI Planner app using Supabase.

## Prerequisites

- Apple Developer Account (requires enrollment in Apple Developer Program - $99/year)
- Supabase project with authentication enabled

## Step 1: Configure Apple Developer Console

### 1.1 Create an App ID

1. Go to [Apple Developer Console](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **+** (Add button)
4. Select **App IDs** and click **Continue**
5. Select **App** and click **Continue**
6. Fill in the details:
   - **Description**: AI Planner App
   - **Bundle ID**: Choose **Explicit** and enter your bundle ID (e.g., `com.yourcompany.aiplanner`)
7. Under **Capabilities**, check **Sign in with Apple**
8. Click **Continue** and then **Register**

### 1.2 Create a Services ID

1. In **Identifiers**, click **+** again
2. Select **Services IDs** and click **Continue**
3. Fill in the details:
   - **Description**: AI Planner Web Auth
   - **Identifier**: Enter a unique identifier (e.g., `com.yourcompany.aiplanner.web`)
4. Check **Sign in with Apple**
5. Click **Configure** next to Sign in with Apple
6. In the configuration:
   - **Primary App ID**: Select the App ID you created in Step 1.1
   - **Domains and Subdomains**: Add your Supabase project domain:
     \`\`\`
     xfqcyqplgqyxayfsubiz.supabase.co
     \`\`\`
   - **Return URLs**: Add your Supabase callback URL:
     \`\`\`
     https://xfqcyqplgqyxayfsubiz.supabase.co/auth/v1/callback
     \`\`\`
7. Click **Save**, then **Continue**, then **Register**

### 1.3 Create a Private Key

1. In **Certificates, Identifiers & Profiles**, go to **Keys**
2. Click **+** to create a new key
3. Enter a **Key Name** (e.g., "Sign in with Apple Key")
4. Check **Sign in with Apple**
5. Click **Configure** next to Sign in with Apple
6. Select your **Primary App ID** from Step 1.1
7. Click **Save**, then **Continue**, then **Register**
8. **Download the key file** (.p8 file) - you can only download this once!
9. Note the **Key ID** shown on the page

## Step 2: Configure Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Apple** and enable it
4. Fill in the required fields:
   - **Services ID**: The identifier from Step 1.2 (e.g., `com.yourcompany.aiplanner.web`)
   - **Team ID**: Found in your Apple Developer account (top right corner)
   - **Key ID**: From Step 1.3
   - **Private Key**: Open the .p8 file you downloaded and paste the entire contents
5. Click **Save**

## Step 3: Test the Integration

1. Go to your app's login page
2. Click the **Apple** sign-in button
3. You should be redirected to Apple's authentication page
4. Sign in with your Apple ID
5. After authentication, you'll be redirected back to your app

## Troubleshooting

### "Invalid client" error
- Verify that the Services ID in Supabase matches exactly what you created in Apple Developer Console
- Check that the Return URL in Apple Developer Console matches your Supabase callback URL

### "Invalid redirect_uri" error
- Ensure the Return URL in Apple Developer Console is exactly:
  \`\`\`
  https://xfqcyqplgqyxayfsubiz.supabase.co/auth/v1/callback
  \`\`\`

### Private key errors
- Make sure you copied the entire contents of the .p8 file, including the header and footer lines
- The key should start with `-----BEGIN PRIVATE KEY-----` and end with `-----END PRIVATE KEY-----`

## Production Considerations

1. **Domain Verification**: For production, add your custom domain to the Apple Services ID configuration
2. **Privacy Policy**: Apple requires a privacy policy URL in your app configuration
3. **Email Relay**: Apple provides email relay service - users can choose to hide their real email
4. **User Data**: Handle the user data returned by Apple appropriately (name is only provided on first sign-in)

## Additional Resources

- [Apple Sign-In Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Supabase Apple Auth Guide](https://supabase.com/docs/guides/auth/social-login/auth-apple)
