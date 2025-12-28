'use client';

import Link from 'next/link';
import ProtectedPage from '@/components/ProtectedPage';
import BookingsList, { Booking } from '@/components/BookingsList';
import Header from '@/components/Header';
import { useEffect, useState } from 'react';

export default function AllBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSync = async () => {
    setSyncing(true);
    setError('');
    setSuccessMsg('');
    try {
      const response = await fetch('/api/bookings/sync');

      if (response.status === 401) {
        window.location.href = '/api/gmail/auth?type=bookings';
        return;
      }

      if (!response.ok) {
        throw new Error('Sync failed');
      }

      const data = await response.json();
      setSuccessMsg(`Synced successfully! Added ${data.added} new bookings.`);
      // Refetch bookings
      const res = await fetch('/api/bookings/all?filter=future');
      if (res.ok) {
        const newData = await res.json();
        setBookings(newData);
      }
    } catch (err) {
      setError('Failed to sync bookings');
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    // Check for sync success param
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('gmail_sync') === 'connected') {
      setSuccessMsg('Gmail connected! Syncing bookings...');
      handleSync();
      window.history.replaceState({}, '', '/bookings');
    }
  }, []);

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
            <button
              onClick={handleSync}
              disabled={syncing}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 disabled:opacity-70"
            >
              {syncing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
              )}
              {syncing ? 'Syncing...' : 'Sync Emails'}
            </button>
          </div>

          {successMsg && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex justify-between items-center">
              <span>{successMsg}</span>
              <button onClick={() => setSuccessMsg('')} className="text-green-500 hover:text-green-700">×</button>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

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
