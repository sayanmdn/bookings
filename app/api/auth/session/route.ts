import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromHeader } from '@/lib/session'

export async function GET(request: NextRequest) {
    const session = getSessionFromHeader(request)

    if (!session) {
        return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({ user: session.user })
}
