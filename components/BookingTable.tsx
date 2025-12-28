'use client';

import { useState } from 'react';
import { Check, X, Phone } from 'lucide-react';

interface Booking {
  _id: string;
  bookNumber: number;
  bookedBy: string;
  guestNames?: string;
  checkIn: string;
  checkOut: string;
  status: string;
  persons: number;
  price: string;
  phoneNumber: number;
  advanceReceived: boolean;
  advanceAmount?: number;
  bookingStatus: 'active' | 'cancelled';
}

interface BookingTableProps {
  bookings: Booking[];
  showAdvanceAction?: boolean;
}

export default function BookingTable({ bookings, showAdvanceAction = false }: BookingTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [localBookings, setLocalBookings] = useState(bookings);
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  const handleAmountChange = (id: string, value: string) => {
    setAmounts({ ...amounts, [id]: value });
  };

  const handleMarkReceived = async (id: string) => {
    const amount = amounts[id];

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setLoadingId(id);
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          advanceReceived: true,
          advanceAmount: Number(amount)
        }),
      });

      if (!response.ok) throw new Error('Failed to update');

      // Remove from list if showing advance pending only
      if (showAdvanceAction) {
        setLocalBookings(localBookings.filter((b) => b._id !== id));
      } else {
        setLocalBookings(
          localBookings.map((b) => (b._id === id ? { ...b, advanceReceived: true, advanceAmount: Number(amount) } : b))
        );
      }

      // Clear the amount input
      setAmounts({ ...amounts, [id]: '' });
    } catch {
      alert('Failed to update booking');
    } finally {
      setLoadingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const calculateStayDays = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleCancelBooking = async (id: string, bookNumber: number) => {
    if (!confirm(`Are you sure you want to cancel booking #${bookNumber}?`)) {
      return;
    }

    setLoadingId(id);
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to cancel booking');

      await response.json();

      // Update local state to mark as cancelled
      setLocalBookings(
        localBookings.map((b) => (b._id === id ? { ...b, bookingStatus: 'cancelled' } : b))
      );
      alert('Booking cancelled successfully');
    } catch {
      alert('Failed to cancel booking');
    } finally {
      setLoadingId(null);
    }
  };

  const handleReactivateBooking = async (id: string, bookNumber: number) => {
    if (!confirm(`Are you sure you want to re-activate booking #${bookNumber}?`)) {
      return;
    }

    setLoadingId(id);
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingStatus: 'active'
        }),
      });

      if (!response.ok) throw new Error('Failed to re-activate booking');

      await response.json();

      // Update local state to mark as active
      setLocalBookings(
        localBookings.map((b) => (b._id === id ? { ...b, bookingStatus: 'active' } : b))
      );
      alert('Booking re-activated successfully');
    } catch {
      alert('Failed to re-activate booking');
    } finally {
      setLoadingId(null);
    }
  };

  if (localBookings.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-lg">No bookings found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Book #
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Guest Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Check-in
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Check-out
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stay Days
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Persons
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phone
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Booking Status
            </th>
            {showAdvanceAction && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
            )}
            {showAdvanceAction && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            )}
            {!showAdvanceAction && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Advance Status
              </th>
            )}
            {!showAdvanceAction && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Advance Amount
              </th>
            )}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {localBookings.map((booking) => (
            <tr key={booking._id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                {booking.bookNumber}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {booking.guestNames || booking.bookedBy}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {formatDate(booking.checkIn)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {formatDate(booking.checkOut)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-medium">
                {calculateStayDays(booking.checkIn, booking.checkOut)} days
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {booking.persons}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {booking.price}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/91${booking.phoneNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-800 hover:underline"
                  >
                    {booking.phoneNumber}
                  </a>
                  <a
                    href={`tel:+91${booking.phoneNumber}`}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-full transition-colors"
                    title="Call this number"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                    }`}
                >
                  {booking.status}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${booking.bookingStatus === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : booking.advanceReceived
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                >
                  {booking.bookingStatus === 'cancelled'
                    ? 'Cancelled'
                    : booking.advanceReceived
                      ? 'Advance Received'
                      : 'Added'}
                </span>
              </td>
              {showAdvanceAction && (
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={amounts[booking._id] || ''}
                    onChange={(e) => handleAmountChange(booking._id, e.target.value)}
                    disabled={loadingId === booking._id}
                    className="border border-gray-300 rounded px-2 py-1 w-32 text-sm disabled:opacity-50 text-gray-900"
                  />
                </td>
              )}
              {showAdvanceAction && (
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleMarkReceived(booking._id)}
                    disabled={loadingId === booking._id}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-xs font-medium disabled:opacity-50"
                  >
                    {loadingId === booking._id ? 'Updating...' : 'Mark Received'}
                  </button>
                </td>
              )}
              {!showAdvanceAction && (
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {booking.advanceReceived ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                </td>
              )}
              {!showAdvanceAction && (
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {booking.advanceAmount ? `₹${booking.advanceAmount}` : '-'}
                </td>
              )}
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                <div className="flex gap-2">
                  {booking.bookingStatus === 'cancelled' ? (
                    <button
                      onClick={() => handleReactivateBooking(booking._id, booking.bookNumber)}
                      disabled={loadingId === booking._id}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingId === booking._id ? 'Re-activating...' : 'Re-activate'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCancelBooking(booking._id, booking.bookNumber)}
                      disabled={loadingId === booking._id}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
