import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

export interface SessionUser {
    id: string
    email: string
    name: string
    image?: string
    role?: string
}

export interface SessionData {
    user: SessionUser
    iat: number
    exp: number
}

const SESSION_SECRET = process.env.SESSION_SECRET || 'default-secret-change-in-production'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days in seconds

/**
 * Create a JWT session token
 */
export function createSession(user: SessionUser): string {
    return jwt.sign({ user }, SESSION_SECRET, {
        expiresIn: SESSION_MAX_AGE,
    })
}

/**
 * Verify and decode a JWT session token
 */
export function verifySession(token: string): SessionData | null {
    try {
        const decoded = jwt.verify(token, SESSION_SECRET) as SessionData
        return decoded
    } catch (error) {
        return null
    }
}

/**
 * Get session from Authorization header
 */
export function getSessionFromHeader(request: NextRequest): SessionData | null {
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    return verifySession(token)
}

/**
 * Verify token from Authorization header and return user
 */
export async function getCurrentUser(request: NextRequest): Promise<SessionUser | null> {
    const session = getSessionFromHeader(request)
    return session?.user || null
}
