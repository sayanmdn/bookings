import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';

export async function GET() {
    try {
        await dbConnect();
        const bookings = await Booking.find({}).sort({ checkIn: 1 }).lean();
        return NextResponse.json(bookings);
    } catch (error) {
        console.error('Error fetching all bookings:', error);
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }
}
