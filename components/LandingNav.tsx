'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { isAuthenticated, clearAuth } from '@/lib/client/auth';
import { useRouter } from 'next/navigation';

export default function LandingNav() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check authentication status on mount and when localStorage changes
        const checkAuth = () => {
            setIsLoggedIn(isAuthenticated());
        };

        checkAuth();

        // Listen for storage changes (e.g., when user logs in/out in another tab)
        window.addEventListener('storage', checkAuth);

        // Custom event for same-tab auth changes
        window.addEventListener('authChange', checkAuth);

        return () => {
            window.removeEventListener('storage', checkAuth);
            window.removeEventListener('authChange', checkAuth);
        };
    }, []);

    const handleLogout = () => {
        clearAuth();
        setIsLoggedIn(false);
        // Dispatch custom event for other components
        window.dispatchEvent(new Event('authChange'));
        router.push('/');
    };

    return (
        <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-white/10 backdrop-blur-md border-b border-white/20">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div className="text-2xl font-bold text-white tracking-tight drop-shadow-md">
                    Pathfinders Nest
                </div>
                <div className="flex gap-4 items-center">
                    {isLoggedIn ? (
                        <>
                            <Link
                                href="/dashboard"
                                className="px-5 py-2 text-white/90 font-medium hover:text-white transition-colors text-sm uppercase tracking-wider"
                            >
                                Go to Dashboard
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="px-6 py-2.5 bg-white text-indigo-900 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="px-5 py-2 text-white/90 font-medium hover:text-white transition-colors text-sm uppercase tracking-wider"
                            >
                                Login
                            </Link>
                            <Link
                                href="/signup"
                                className="px-6 py-2.5 bg-white text-indigo-900 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
                            >
                                Book Now
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
