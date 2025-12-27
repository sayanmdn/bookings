import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'

/**
 * Verify JWT token endpoint
 * Accepts token from Authorization header and returns user data if valid
 */
export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    const session = verifySession(token)

    if (!session) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    return NextResponse.json({ user: session.user })
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { token } = body

        if (!token) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 })
        }

        const session = verifySession(token)

        if (!session) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
        }

        return NextResponse.json({ user: session.user })
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
}
