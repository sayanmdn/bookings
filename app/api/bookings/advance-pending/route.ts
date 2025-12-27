import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';

export async function GET() {
    try {
        await dbConnect();
        const bookings = await Booking.find({
            $and: [
                {
                    $or: [
                        { advanceReceived: false },
                        { advanceReceived: { $exists: false } }
                    ]
                },
                {
                    $or: [
                        { bookingStatus: 'active' },
                        { bookingStatus: { $exists: false } }
                    ]
                }
            ]
        }).sort({ checkIn: 1 }).lean();
        return NextResponse.json(bookings);
    } catch (error) {
        console.error('Error fetching advance pending bookings:', error);
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }
}
