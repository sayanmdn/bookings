'use client'

import ProtectedPage from '@/components/ProtectedPage';
import Link from 'next/link';
import BookingTable from '@/components/BookingTable';
import Header from '@/components/Header';
import { useEffect, useState } from 'react';

interface IBooking {
  _id: string;
  [key: string]: unknown;
}

export default function AdvancePendingPage() {
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const response = await fetch('/api/bookings/advance-pending');
        if (response.ok) {
          const data = await response.json();
          setBookings(data);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  return (
    <ProtectedPage>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Advance Not Received</h1>
            <p className="text-gray-600">
              {loading ? 'Loading...' : `Bookings pending advance payment - ${bookings.length} total`}
            </p>
          </div>

          <div className="mb-6 flex gap-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Home
            </Link>
            <Link
              href="/bookings"
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              All Bookings
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <BookingTable bookings={bookings as never[]} showAdvanceAction={true} />
          )}
        </div>
      </div>
    </ProtectedPage>
  );
}
