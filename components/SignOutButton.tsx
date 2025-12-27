"use client"

import { LogOut } from "lucide-react"
import { useAuth } from "./AuthProvider"

export default function SignOutButton() {
    const { logout } = useAuth()

    return (
        <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
            <LogOut className="w-4 h-4" />
            Sign Out
        </button>
    )
}
