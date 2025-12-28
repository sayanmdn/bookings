'use client';

import { format } from 'date-fns';

export interface Booking {
    _id: string;
    bookNumber: number;
    bookedBy: string;
    guestNames?: string;
    checkIn: string;
    checkOut: string;
    bookedOn: string;
    status: string;
    bookingStatus: 'active' | 'cancelled';
    unitType: string;
    advanceReceived: boolean;
    // Add other fields as needed from your schema, but these are the required ones for display
}

interface BookingsListProps {
    bookings: Booking[];
}

export default function BookingsList({ bookings }: BookingsListProps) {
    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'dd MMM yyyy');
        } catch {
            return dateString;
        }
    };

    // Helper to determine display status
    const getDisplayStatus = (booking: Booking) => {
        // Logic based on user requirement: "Status should be either confirmed or not confirmed"
        if (booking.bookingStatus === 'cancelled') return 'Not Confirmed';
        if (booking.status?.toLowerCase() === 'confirmed') return 'Confirmed';
        return 'Not Confirmed';
    };

    const getStatusColor = (status: string) => {
        return status === 'Confirmed'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800';
    };

    if (bookings.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500 text-lg">No recent bookings found</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Mobile View - Cards */}
            <div className="block sm:hidden">
                <ul className="divide-y divide-gray-200">
                    {bookings.map((booking) => {
                        const status = getDisplayStatus(booking);
                        return (
                            <li key={booking._id} className="p-4 hover:bg-gray-50">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span className="text-xs font-semibold text-gray-500">#{booking.bookNumber}</span>
                                        <h3 className="text-sm font-bold text-gray-900">{booking.bookedBy}</h3>
                                        {booking.guestNames && booking.guestNames !== booking.bookedBy && (
                                            <p className="text-xs text-gray-600">Guest: {booking.guestNames}</p>
                                        )}
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                                        {status}
                                    </span>
                                </div>

                                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
                                    <div>
                                        <p className="text-gray-400">Check-in</p>
                                        <p className="font-medium text-gray-900">{formatDate(booking.checkIn)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400">Check-out</p>
                                        <p className="font-medium text-gray-900">{formatDate(booking.checkOut)}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-gray-400">Platform</p>
                                        <p className="font-medium text-gray-900">{booking.unitType || 'N/A'}</p>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Desktop View - Table */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Booking ID
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Platform
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Check-in
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Check-out
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Names
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {bookings.map((booking) => {
                            const status = getDisplayStatus(booking);
                            return (
                                <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        #{booking.bookNumber}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {booking.unitType || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(booking.checkIn)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(booking.checkOut)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{booking.bookedBy}</span>
                                            {booking.guestNames && booking.guestNames !== booking.bookedBy && (
                                                <span className="text-xs text-gray-500">Guest: {booking.guestNames}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(status)}`}>
                                            {status}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
