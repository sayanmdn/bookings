import Link from 'next/link';
import BookingTable from '@/components/BookingTable';

async function getAllBookings() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/bookings`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch bookings');
    }

    const data = await response.json();
    return data.bookings;
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    return [];
  }
}

export default async function AllBookingsPage() {
  const bookings = await getAllBookings();

  const advancePending = bookings.filter((b: any) => !b.advanceReceived).length;
  const advanceReceived = bookings.filter((b: any) => b.advanceReceived).length;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Bookings</h1>
          <p className="text-gray-600">
            Total: {bookings.length} | Advance Received: {advanceReceived} | Pending: {advancePending}
          </p>
        </div>

        <div className="mb-6 flex gap-4">
          <Link
            href="/"
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

        <BookingTable bookings={bookings} showAdvanceAction={false} />
      </div>
    </div>
  );
}
