'use client';

import { LogOut } from "lucide-react"
import { handleSignOut } from "@/lib/actions/auth"

export default function InvoiceHeader() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Booking Management</h2>
        </div>

        <form action={handleSignOut}>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </form>
      </div>
    </header>
  )
}
