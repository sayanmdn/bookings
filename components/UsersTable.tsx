'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Search, Shield, UserCog, Users as UsersIcon } from 'lucide-react'
import { UserRole } from '@/lib/models/DefaultUser'

interface User {
  id: string
  email: string
  name: string
  profileImage?: string
  role: UserRole
  createdAt?: string
  updatedAt?: string
}

interface UsersTableProps {
  users: User[]
}

export default function UsersTable({ users }: UsersTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (updatingId) return

    setUpdatingId(userId)

    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update role')
      }

      // Refresh page to show updated data
      window.location.reload()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update role')
    } finally {
      setUpdatingId(null)
    }
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-red-100 text-red-800 border-red-200'
      case UserRole.EDITOR:
        return 'bg-green-100 text-green-800 border-green-200'
      case UserRole.USER:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Shield className="w-4 h-4" />
      case UserRole.EDITOR:
        return <UserCog className="w-4 h-4" />
      case UserRole.USER:
        return <UsersIcon className="w-4 h-4" />
    }
  }

  return (
    <div className="p-6">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600">Editors</p>
          <p className="text-2xl font-bold text-green-900">
            {users.filter(u => u.role === UserRole.EDITOR).length}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-gray-900">
            {users.filter(u => u.role === UserRole.USER).length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                User
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Role
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Joined
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    {user.profileImage ? (
                      <Image
                        src={user.profileImage}
                        alt={user.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="font-medium text-gray-900">
                      {user.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-gray-600">
                  {user.email}
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(user.role)}`}>
                    {getRoleIcon(user.role)}
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-4 text-gray-600 text-sm">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : '-'
                  }
                </td>
                <td className="px-4 py-4">
                  {user.role !== UserRole.ADMIN ? (
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                      disabled={updatingId === user.id}
                      className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value={UserRole.USER}>USER</option>
                      <option value={UserRole.EDITOR}>EDITOR</option>
                    </select>
                  ) : (
                    <span className="text-sm text-gray-500 italic">
                      Immutable
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No users found matching &quot;{searchTerm}&quot;
          </div>
        )}
      </div>
    </div>
  )
}
