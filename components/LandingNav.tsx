'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { isAuthenticated, clearAuth } from '@/lib/client/auth';
import { useRouter } from 'next/navigation';
import { Phone, X } from 'lucide-react';

export default function LandingNav() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showContactsModal, setShowContactsModal] = useState(false);
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
                                onClick={() => setShowContactsModal(true)}
                                className="px-5 py-2 text-white/90 font-medium hover:text-white transition-colors text-sm uppercase tracking-wider flex items-center gap-2"
                            >
                                <Phone size={16} />
                                Contacts
                            </button>
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

            {/* Contacts Modal */}
            {showContactsModal && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={() => setShowContactsModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Contact Us</h2>
                            <button
                                onClick={() => setShowContactsModal(false)}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <a
                                href="tel:07001671481"
                                className="flex items-center gap-4 p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors group"
                            >
                                <div className="bg-indigo-600 p-3 rounded-full group-hover:bg-indigo-700 transition-colors">
                                    <Phone className="text-white" size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Primary Contact</p>
                                    <p className="text-lg font-semibold text-gray-800">07001671481</p>
                                </div>
                            </a>

                            <a
                                href="tel:7001137041"
                                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                            >
                                <div className="bg-gray-600 p-3 rounded-full group-hover:bg-gray-700 transition-colors">
                                    <Phone className="text-white" size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Secondary Contact</p>
                                    <p className="text-lg font-semibold text-gray-800">7001137041</p>
                                </div>
                            </a>
                        </div>

                        <p className="mt-6 text-sm text-gray-500 text-center">
                            Click on a number to call
                        </p>
                    </div>
                </div>
            )}
        </nav>
    );
}
