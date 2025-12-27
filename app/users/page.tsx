'use client'

import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'

interface User {
    _id: string
    name: string
    email: string
    image?: string
    role: 'USER' | 'EDITOR' | 'ADMIN'
}

export default function UsersPage() {
    const { user, isAuthenticated, isLoading: authLoading, token } = useAuth()
    const router = useRouter()
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    const fetchUsers = async (query = '') => {
        setIsLoading(true)
        try {
            const url = query ? `/api/users?query=${encodeURIComponent(query)}` : '/api/users'
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setUsers(data)
            } else {
                console.error('Failed to fetch users')
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                router.push('/login')
            } else if (user?.role !== 'ADMIN') {
                router.push('/dashboard')
            } else {
                fetchUsers()
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, isAuthenticated, user, router])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        fetchUsers(searchQuery)
    }

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            })

            if (response.ok) {
                // Update local state
                setUsers(users.map(u => u._id === userId ? { ...u, role: newRole as 'USER' | 'EDITOR' | 'ADMIN' } : u))
            } else {
                alert('Failed to update role')
            }
        } catch (error) {
            console.error('Error updating role:', error)
            alert('Error updating role')
        }
    }

    if (authLoading || (isLoading && users.length === 0)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    if (!isAuthenticated || user?.role !== 'ADMIN') {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Back to Dashboard
                    </button>
                </div>

                <div className="bg-white shadow rounded-lg mb-8 p-6">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Search
                        </button>
                    </form>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <ul className="divide-y divide-gray-200">
                        {users.map((u) => (
                            <li key={u._id} className="p-6 hover:bg-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="relative h-12 w-12 flex-shrink-0">
                                        <Image
                                            src={u.image || '/placeholder-user.jpg'}
                                            alt={u.name}
                                            fill
                                            className="rounded-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{u.name}</p>
                                        <p className="text-sm text-gray-500">{u.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                                        u.role === 'EDITOR' ? 'bg-green-100 text-green-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {u.role}
                                    </span>
                                    {u.email !== 'sayanmdn@gmail.com' && (
                                        <select
                                            value={u.role}
                                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                                            disabled={u._id === user?.id}
                                        >
                                            <option value="USER">USER</option>
                                            <option value="EDITOR">EDITOR</option>
                                            <option value="ADMIN">ADMIN</option>
                                        </select>
                                    )}
                                </div>
                            </li>
                        ))}
                        {users.length === 0 && (
                            <li className="p-6 text-center text-gray-500">No users found</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    )
}
