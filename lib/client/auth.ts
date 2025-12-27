/**
 * Client-side authentication utilities for localStorage management
 */

export interface AuthUser {
    id: string
    email: string
    name: string
    image?: string
}

export interface AuthData {
    token: string
    user: AuthUser
}

const AUTH_TOKEN_KEY = 'auth_token'
const AUTH_USER_KEY = 'auth_user'

/**
 * Save authentication data to localStorage
 */
export function saveAuth(token: string, user: AuthUser): void {
    if (typeof window === 'undefined') return

    localStorage.setItem(AUTH_TOKEN_KEY, token)
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

/**
 * Get authentication data from localStorage
 */
export function getAuth(): AuthData | null {
    if (typeof window === 'undefined') return null

    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    const userStr = localStorage.getItem(AUTH_USER_KEY)

    if (!token || !userStr) return null

    try {
        const user = JSON.parse(userStr) as AuthUser
        return { token, user }
    } catch (error) {
        console.error('Failed to parse user data:', error)
        clearAuth()
        return null
    }
}

/**
 * Get only the auth token
 */
export function getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(AUTH_TOKEN_KEY)
}

/**
 * Get only the user data
 */
export function getUser(): AuthUser | null {
    if (typeof window === 'undefined') return null

    const userStr = localStorage.getItem(AUTH_USER_KEY)
    if (!userStr) return null

    try {
        return JSON.parse(userStr) as AuthUser
    } catch (error) {
        console.error('Failed to parse user data:', error)
        return null
    }
}

/**
 * Clear authentication data from localStorage
 */
export function clearAuth(): void {
    if (typeof window === 'undefined') return

    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false

    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    const userStr = localStorage.getItem(AUTH_USER_KEY)

    return !!(token && userStr)
}
