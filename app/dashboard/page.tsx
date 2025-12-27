'use client'

import Link from 'next/link';
import FileUpload from '@/components/FileUpload';
import Header from '@/components/Header';
import ProtectedPage from '@/components/ProtectedPage';
import { Calendar, CheckCircle, FileSpreadsheet, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Stats {
  total: number
  pending: number
  received: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, received: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/bookings/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <ProtectedPage>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Booking Management System</h1>
            <p className="text-gray-600">Upload and manage your booking data</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link href="/bookings" className="block">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                    <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.total}</p>
                  </div>
                  <Calendar className="w-12 h-12 text-blue-500" />
                </div>
              </div>
            </Link>

            <Link href="/advance-pending" className="block">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Advance Pending</p>
                    <p className="text-3xl font-bold text-orange-600">{loading ? '...' : stats.pending}</p>
                  </div>
                  <FileSpreadsheet className="w-12 h-12 text-orange-500" />
                </div>
              </div>
            </Link>

            <Link href="/active-advance" className="block">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active - Advance Received</p>
                    <p className="text-3xl font-bold text-green-600">{loading ? '...' : stats.received}</p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
              </div>
            </Link>
          </div>

          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Upload Excel File</h2>
            <FileUpload />
          </div>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <Link
              href="/advance-pending"
              className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <FileSpreadsheet className="w-8 h-8 text-orange-500" />
                <h3 className="text-xl font-semibold text-gray-900">Advance Not Received</h3>
              </div>
              <p className="text-gray-600 mb-4">
                View and manage bookings pending advance payment
              </p>
              <span className="text-orange-600 font-medium">
                {loading ? '...' : stats.pending} pending →
              </span>
            </Link>

            <Link
              href="/active-advance"
              className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <h3 className="text-xl font-semibold text-gray-900">Active Advance Received</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Bookings with advance received and checkout not passed
              </p>
              <span className="text-green-600 font-medium">
                {loading ? '...' : stats.received} active →
              </span>
            </Link>

            <Link
              href="/bookings"
              className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-8 h-8 text-blue-500" />
                <h3 className="text-xl font-semibold text-gray-900">All Bookings</h3>
              </div>
              <p className="text-gray-600 mb-4">
                View complete list of all bookings
              </p>
              <span className="text-blue-600 font-medium">
                {loading ? '...' : stats.total} total →
              </span>
            </Link>

            <Link
              href="/invoice"
              className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <FileText className="w-8 h-8 text-green-500" />
                <h3 className="text-xl font-semibold text-gray-900">Generate Invoice</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Create professional PDF invoices for bookings
              </p>
              <span className="text-green-600 font-medium">
                Create invoice →
              </span>
            </Link>

            <Link
              href="/invoices"
              className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <FileText className="w-8 h-8 text-purple-500" />
                <h3 className="text-xl font-semibold text-gray-900">View Invoices</h3>
              </div>
              <p className="text-gray-600 mb-4">
                View all generated invoices and payment status
              </p>
              <span className="text-purple-600 font-medium">
                View all →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
