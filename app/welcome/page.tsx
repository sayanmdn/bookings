'use client'

import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Image from 'next/image'

export default function WelcomePage() {
    const { user, isAuthenticated, isLoading, logout } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login')
            } else if (user?.role === 'ADMIN' || user?.role === 'EDITOR') {
                router.push('/dashboard')
            }
        }
    }, [isAuthenticated, isLoading, user, router])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    // Only redirect if explicitly allowed to go somewhere else
    if (!isAuthenticated || (user?.role === 'ADMIN' || user?.role === 'EDITOR')) {
        return null // Will redirect
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center space-y-6">
                <div className="flex justify-center">
                    <div className="relative h-24 w-24">
                        <Image
                            src={user?.image || '/placeholder-user.jpg'}
                            alt={user?.name || 'User'}
                            fill
                            className="rounded-full object-cover border-4 border-gray-100"
                        />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome, {user?.name.split(' ')[0]}!
                </h1>

                <p className="text-gray-600">
                    Your account is currently under review. access to the dashboard is restricted until your role is updated.
                </p>

                <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                        Signed in as {user?.email}
                    </p>
                </div>

                <button
                    onClick={logout}
                    className="mt-4 text-sm text-red-600 hover:text-red-800 underline"
                >
                    Sign out
                </button>
            </div>
        </div>
    )
}
