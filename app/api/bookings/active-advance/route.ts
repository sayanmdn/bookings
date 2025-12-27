import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';

export async function GET() {
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

        return NextResponse.json(bookings);
    } catch (error) {
        console.error('Error fetching active advance received bookings:', error);
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }
}
