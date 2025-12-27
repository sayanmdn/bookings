import { NextRequest, NextResponse } from 'next/server'
import { GoogleAuth } from '@/lib/google-auth'
import { createSession } from '@/lib/session'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const storedState = request.cookies.get('oauth_state')?.value

        // Verify state to prevent CSRF attacks
        if (!state || !storedState || state !== storedState) {
            console.error('State mismatch or missing state')
            return NextResponse.redirect(new URL('/login?error=invalid_state', request.url))
        }

        if (!code) {
            console.error('No authorization code received')
            return NextResponse.redirect(new URL('/login?error=no_code', request.url))
        }

        const googleAuth = new GoogleAuth()

        // Exchange code for tokens
        const tokens = await googleAuth.getTokens(code)

        // Fetch user profile
        const profile = await googleAuth.getUserProfile(tokens.access_token)

        // Connect to database
        await dbConnect()

        // Find or create user
        let user = await User.findOne({ email: profile.email })

        if (!user) {
            user = await User.create({
                name: profile.name,
                email: profile.email,
                image: profile.picture,
            })
        } else {
            // Update user profile if changed
            user.name = profile.name
            user.image = profile.picture
            await user.save()
        }

        // Create session token
        const sessionToken = createSession({
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
        })

        console.log('Session created for user:', user.email)

        // Prepare user data to pass to client
        const userData = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
        }

        // Redirect to auth callback page with token and user data
        // We'll pass this via URL params which the client will immediately store in localStorage
        const callbackUrl = new URL('/auth-callback', request.url)
        callbackUrl.searchParams.set('token', sessionToken)
        callbackUrl.searchParams.set('user', JSON.stringify(userData))

        const response = NextResponse.redirect(callbackUrl)

        // Clear the oauth_state cookie
        response.cookies.delete('oauth_state')

        console.log('Redirecting to auth-callback page with token')
        return response
    } catch (error) {
        console.error('Error in Google OAuth callback:', error)
        return NextResponse.redirect(new URL('/login?error=callback_failed', request.url))
    }
}
