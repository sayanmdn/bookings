'use client';

import Link from 'next/link';
import ProtectedPage from '@/components/ProtectedPage';
import BookingsList, { Booking } from '@/components/BookingsList';
import Header from '@/components/Header';
import { useEffect, useState } from 'react';

export default function AllBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const response = await fetch('/api/bookings/all?filter=future');
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

  const advancePending = bookings.filter((b) =>
    (b.advanceReceived as boolean) !== true &&
    ((b.bookingStatus as string) === 'active' || !(b.bookingStatus as string))
  ).length;

  const advanceReceived = bookings.filter((b) => (b.advanceReceived as boolean) === true).length;

  return (
    <ProtectedPage>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">All Bookings</h1>
            <p className="text-gray-600">
              {loading ? 'Loading...' : `Total: ${bookings.length} | Advance Received: ${advanceReceived} | Pending: ${advancePending}`}
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
              href="/advance-pending"
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            >
              Advance Pending ({advancePending})
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <BookingsList bookings={bookings} />
          )}
        </div>
      </div>
    </ProtectedPage>
  );
}
