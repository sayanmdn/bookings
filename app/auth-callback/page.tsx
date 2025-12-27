'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

export default function AuthCallback() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { login } = useAuth()

    useEffect(() => {
        const token = searchParams.get('token')
        const userStr = searchParams.get('user')

        if (token && userStr) {
            try {
                const user = JSON.parse(userStr)

                // Save to localStorage via AuthProvider
                login(token, user)

                // Redirect to dashboard
                router.push('/dashboard')
            } catch (error) {
                console.error('Failed to parse user data:', error)
                router.push('/login?error=auth_failed')
            }
        } else {
            console.error('Missing token or user data')
            router.push('/login?error=auth_failed')
        }
    }, [searchParams, router, login])

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Completing sign in...
                </h1>
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        </div>
    )
}
