import Link from 'next/link';
import BookingTable from '@/components/BookingTable';
import Header from '@/components/Header';
import dbConnect from '@/lib/mongodb';
import Booking, { IBooking } from '@/lib/models/Booking';

// Disable caching for this page to always show fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getActiveAdvanceReceivedBookings(): Promise<IBooking[]> {
  try {
    await dbConnect();

    // Get current date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookings = await Booking.find({
      advanceReceived: true,
      checkOut: { $gte: today }, // Check-out date is today or in the future
      $or: [
        { bookingStatus: 'active' },
        { bookingStatus: { $exists: false } }
      ]
    }).sort({ checkOut: 1 }).lean();

    return JSON.parse(JSON.stringify(bookings));
  } catch (error) {
    console.error('Error fetching active advance received bookings:', error);
    return [];
  }
}

export default async function ActiveAdvancePage() {
  const bookings = await getActiveAdvanceReceivedBookings();

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Active Bookings - Advance Received</h1>
          <p className="text-gray-600">
            Bookings with advance received and checkout date not passed - {bookings.length} total
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
          <Link
            href="/advance-pending"
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            Advance Pending
          </Link>
        </div>

        <BookingTable bookings={bookings as never[]} showAdvanceAction={false} />
      </div>
    </div>
  );
}
