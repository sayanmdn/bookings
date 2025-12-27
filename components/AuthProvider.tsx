'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveAuth, getAuth, clearAuth, AuthUser } from '@/lib/client/auth'

interface AuthContextType {
    user: AuthUser | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (token: string, user: AuthUser) => void
    logout: () => void
    checkAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    const checkAuth = () => {
        const authData = getAuth()
        if (authData) {
            setUser(authData.user)
            setToken(authData.token)
        } else {
            setUser(null)
            setToken(null)
        }
    }

    useEffect(() => {
        // Load auth from localStorage on mount
        checkAuth()
        setIsLoading(false)
    }, [])

    const login = (newToken: string, newUser: AuthUser) => {
        saveAuth(newToken, newUser)
        setToken(newToken)
        setUser(newUser)
    }

    const logout = async () => {
        try {
            // Call logout API
            await fetch('/api/auth/logout', { method: 'POST' })
        } catch (error) {
            console.error('Error calling logout API:', error)
        }

        // Clear localStorage and state
        clearAuth()
        setUser(null)
        setToken(null)

        // Redirect to login
        router.push('/login')
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!user && !!token,
                isLoading,
                login,
                logout,
                checkAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
