'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ProtectedPage from '@/components/ProtectedPage';
import { Search, User as UserIcon, Mail } from 'lucide-react';
import Image from 'next/image';

interface User {
    _id: string;
    name: string;
    email: string;
    image?: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (search) params.append('search', search);

                const response = await fetch(`/api/users?${params.toString()}`);
                if (response.ok) {
                    const data = await response.json();
                    setUsers(data);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(fetchUsers, 300);
        return () => clearTimeout(debounceTimer);
    }, [search]);

    return (
        <ProtectedPage>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Users Directory</h1>
                        <p className="text-gray-600">Browse and search registered users</p>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-8 max-w-xl">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Users Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white rounded-lg p-6 shadow-md animate-pulse h-32"></div>
                            ))}
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
                            <UserIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">No users found matching &quot;{search}&quot;</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {users.map((user) => (
                                <div key={user._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                            {user.image ? (
                                                <Image
                                                    src={user.image}
                                                    alt={user.name}
                                                    width={48}
                                                    height={48}
                                                    className="rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                                    <span className="text-xl font-semibold">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                {user.name}
                                            </h3>
                                            <div className="flex items-center text-gray-600 mt-1">
                                                <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                                                <span className="text-sm truncate">{user.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedPage>
    );
}
