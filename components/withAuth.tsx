'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

/**
 * HOC to protect pages that require authentication
 * Redirects to login if user is not authenticated
 */
export default function withAuth<P extends object>(
    WrappedComponent: React.ComponentType<P>
) {
    return function AuthProtectedComponent(props: P) {
        const { isAuthenticated, isLoading } = useAuth()
        const router = useRouter()

        useEffect(() => {
            if (!isLoading && !isAuthenticated) {
                router.push('/login')
            }
        }, [isAuthenticated, isLoading, router])

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

        // Don't render protected content if not authenticated
        if (!isAuthenticated) {
            return null
        }

        return <WrappedComponent {...props} />
    }
}
