'use client'

import { useAuth } from "./AuthProvider"
import SignOutButton from "./SignOutButton"
import Link from "next/link"

export default function Header() {
  const { user, isAuthenticated } = useAuth()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <Link href="/dashboard">
            <h2 className="text-xl font-semibold text-gray-800 cursor-pointer hover:text-gray-600 transition-colors">Booking Management</h2>
          </Link>
          {isAuthenticated && user?.email && (
            <p className="text-sm text-gray-600">Signed in as {user.email}</p>
          )}
        </div>

        {isAuthenticated && <SignOutButton />}
      </div>
    </header>
  )
}
