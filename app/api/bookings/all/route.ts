import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';

import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const searchParams = request.nextUrl.searchParams;
        const filter = searchParams.get('filter');

        const query: { checkOut?: { $gte: Date } } = {};

        if (filter === 'future') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            query.checkOut = { $gte: today };
        }

        const bookings = await Booking.find(query).sort({ checkIn: 1 }).lean();
        return NextResponse.json(bookings);
    } catch (error) {
        console.error('Error fetching all bookings:', error);
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }
}
