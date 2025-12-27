import { NextRequest, NextResponse } from 'next/server'
import { GoogleAuth } from '@/lib/google-auth'

export async function GET(request: NextRequest) {
    try {
        const googleAuth = new GoogleAuth()

        // Generate a random state for CSRF protection
        const state = crypto.randomUUID()

        // Store state in cookie for verification in callback
        const response = NextResponse.redirect(googleAuth.getAuthUrl(state))
        response.cookies.set('oauth_state', state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 10, // 10 minutes
            path: '/',
        })

        return response
    } catch (error) {
        console.error('Error initiating Google OAuth:', error)
        return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
    }
}
