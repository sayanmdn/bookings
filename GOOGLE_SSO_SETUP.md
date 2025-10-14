# Google SSO Setup Guide

This guide will help you set up Google Single Sign-On (SSO) for your booking management system.

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - Choose **External** user type
   - Fill in the required fields:
     - App name: `Booking Management System`
     - User support email: Your email
     - Developer contact: Your email
   - Click **Save and Continue**
   - Skip the Scopes section (click **Save and Continue**)
   - Add test users if needed (your email)
   - Click **Save and Continue**

6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: `Booking Management`
   - **Authorized JavaScript origins:**
     - `http://localhost:3000` (for local development)
     - `https://your-vercel-app.vercel.app` (your production URL)
   - **Authorized redirect URIs:**
     - `http://localhost:3000/api/auth/callback/google` (for local)
     - `https://your-vercel-app.vercel.app/api/auth/callback/google` (for production)

7. Click **Create**
8. Copy your **Client ID** and **Client Secret**

## Step 2: Generate AUTH_SECRET

Run this command in your terminal to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output.

## Step 3: Update Environment Variables

### Local Development (.env.local)

Update your `.env.local` file with these values:

```env
MONGODB_URI=your_mongodb_connection_string
NEXT_TELEMETRY_DISABLED=1

# NextAuth Configuration
AUTH_SECRET=paste-the-generated-secret-here
GOOGLE_CLIENT_ID=paste-your-client-id-here
GOOGLE_CLIENT_SECRET=paste-your-client-secret-here
```

### Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add these environment variables:
   - `AUTH_SECRET` - The secret you generated
   - `GOOGLE_CLIENT_ID` - Your Google Client ID
   - `GOOGLE_CLIENT_SECRET` - Your Google Client Secret
   - `MONGODB_URI` - Your MongoDB connection string
   - `NEXT_TELEMETRY_DISABLED` - Set to `1`

4. Click **Save**
5. Redeploy your application

## Step 4: Update Google OAuth Redirect URIs (After Vercel Deploy)

Once you have your Vercel URL:

1. Go back to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add:
   - `https://your-actual-vercel-url.vercel.app/api/auth/callback/google`
5. Click **Save**

## Step 5: Test the Authentication

1. Visit your deployed site
2. You should be redirected to the login page
3. Click "Sign in with Google"
4. Choose your Google account
5. You'll be redirected back to the home page

## How It Works

- **Middleware** (`middleware.ts`) protects all routes except `/login` and `/api/auth/*`
- Unauthenticated users are automatically redirected to `/login`
- After successful Google authentication, users are redirected to the home page
- The **Header** component shows the signed-in user's email and provides a sign-out button
- Signed-out users are redirected back to `/login`

## Security Features

✅ All pages are protected by authentication
✅ Only authenticated Google users can access the system
✅ Secure session management with NextAuth.js
✅ Sign out functionality to end sessions

## Troubleshooting

### "Redirect URI mismatch" error
- Make sure your redirect URIs in Google Cloud Console exactly match your application URLs
- Include both `http://localhost:3000` (development) and your Vercel URL (production)

### Can't sign in after deployment
- Check that all environment variables are set in Vercel
- Verify your Google OAuth redirect URIs include your Vercel URL
- Redeploy after adding environment variables

### "Invalid client" error
- Double-check your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Make sure there are no extra spaces or line breaks

## Optional: Restrict Access to Specific Users

If you want to allow only specific Google accounts, modify `auth.ts`:

```typescript
callbacks: {
  authorized: async ({ auth }) => {
    return !!auth
  },
  signIn: async ({ user }) => {
    // Only allow specific email addresses
    const allowedEmails = ['your-email@gmail.com', 'another@gmail.com']
    return allowedEmails.includes(user.email || '')
  },
},
```

Redeploy after making this change.
