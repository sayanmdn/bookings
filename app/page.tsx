import Link from 'next/link';
import FileUpload from '@/components/FileUpload';
import { Calendar, CheckCircle, FileSpreadsheet } from 'lucide-react';

async function getStats() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/bookings`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return { total: 0, pending: 0, received: 0 };
    }

    const data = await response.json();
    const bookings = data.bookings;

    return {
      total: bookings.length,
      pending: bookings.filter((b: any) => !b.advanceReceived).length,
      received: bookings.filter((b: any) => b.advanceReceived).length,
    };
  } catch (error) {
    return { total: 0, pending: 0, received: 0 };
  }
}

export default async function Home() {
  const stats = await getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Booking Management System</h1>
          <p className="text-gray-600">Upload and manage your booking data</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Calendar className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Advance Pending</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <FileSpreadsheet className="w-12 h-12 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Advance Received</p>
                <p className="text-3xl font-bold text-green-600">{stats.received}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Upload Excel File</h2>
          <FileUpload />
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/advance-pending"
            className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Advance Not Received</h3>
            <p className="text-gray-600 mb-4">
              View and manage bookings pending advance payment
            </p>
            <span className="text-orange-600 font-medium">
              {stats.pending} pending →
            </span>
          </Link>

          <Link
            href="/bookings"
            className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All Bookings</h3>
            <p className="text-gray-600 mb-4">
              View complete list of all bookings
            </p>
            <span className="text-blue-600 font-medium">
              {stats.total} total →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
