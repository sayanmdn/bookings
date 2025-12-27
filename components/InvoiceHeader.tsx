'use client';

import { LogOut } from "lucide-react"
import { clearAuth } from "@/lib/client/auth"
import { useRouter } from "next/navigation"

export default function InvoiceHeader() {
  const router = useRouter()

  const handleLogout = () => {
    clearAuth()
    router.push('/login')
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Booking Management</h2>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </header>
  )
}
