import Link from 'next/link';
import BookingTable from '@/components/BookingTable';
import Header from '@/components/Header';
import dbConnect from '@/lib/mongodb';
import Booking, { IBooking } from '@/lib/models/Booking';

// Disable caching for this page to always show fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getAllBookings(): Promise<IBooking[]> {
  try {
    await dbConnect();
    const bookings = await Booking.find({}).sort({ checkIn: 1 }).lean();
    return JSON.parse(JSON.stringify(bookings));
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    return [];
  }
}

export default async function AllBookingsPage() {
  const bookings = await getAllBookings();

  // Count pending advance (where advanceReceived is false or doesn't exist, and booking is active or doesn't exist)
  const advancePending = bookings.filter((b: IBooking) =>
    b.advanceReceived !== true &&
    (b.bookingStatus === 'active' || !b.bookingStatus)
  ).length;

  const advanceReceived = bookings.filter((b: IBooking) => b.advanceReceived === true).length;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Bookings</h1>
          <p className="text-gray-600">
            Total: {bookings.length} | Advance Received: {advanceReceived} | Pending: {advancePending}
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

        <BookingTable bookings={bookings as never[]} showAdvanceAction={false} />
      </div>
    </div>
  );
}
