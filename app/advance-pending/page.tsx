import Link from 'next/link';
import BookingTable from '@/components/BookingTable';
import Header from '@/components/Header';
import dbConnect from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';

async function getAdvancePendingBookings() {
  try {
    await dbConnect();
    const bookings = await Booking.find({ advanceReceived: false }).sort({ checkIn: 1 }).lean();
    return JSON.parse(JSON.stringify(bookings));
  } catch (error) {
    console.error('Error fetching advance pending bookings:', error);
    return [];
  }
}

export default async function AdvancePendingPage() {
  const bookings = await getAdvancePendingBookings();

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Advance Not Received</h1>
          <p className="text-gray-600">
            Bookings pending advance payment - {bookings.length} total
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
            href="/bookings"
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            All Bookings
          </Link>
        </div>

        <BookingTable bookings={bookings as never[]} showAdvanceAction={true} />
      </div>
    </div>
  );
}
