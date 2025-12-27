'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

interface ProtectedPageProps {
    children: React.ReactNode
    allowedRoles?: string[]
}

/**
 * Protected page wrapper that checks authentication
 * Redirects to login if user is not authenticated
 */
export default function ProtectedPage({ children, allowedRoles }: ProtectedPageProps) {
    const { user, isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login')
                return
            }

            // Fallback for missing role (e.g. old sessions)
            const userRole = user?.role || 'USER'
            const currentPath = window.location.pathname

            if (allowedRoles && !allowedRoles.includes(userRole)) {
                // Redirect based on role
                if (userRole === 'USER') {
                    if (currentPath !== '/welcome') router.push('/welcome')
                } else {
                    if (currentPath !== '/dashboard') router.push('/dashboard')
                }
            } else if (userRole === 'USER' && currentPath !== '/welcome') {
                // Default global protection: USER cannot access anything except welcome
                router.push('/welcome')
            }
        }
    }, [isAuthenticated, isLoading, router, user, allowedRoles])

    // Show loading state while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                </div>
            </div>
        )
    }

    // Don't render protected content if not authenticated or not allowed
    // Safe-guard for rendering
    const userRole = user?.role || 'USER'
    if (!isAuthenticated || (allowedRoles && !allowedRoles.includes(userRole))) {
        return null
    }

    // Double check specific USER restriction
    if (userRole === 'USER' && window.location.pathname !== '/welcome') {
        // Checking pathname here in render is tricky because of hydration, but safe enough for now
        return null
    }
    return <>{children}</>
}
