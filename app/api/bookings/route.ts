import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const advancePending = searchParams.get('advancePending');

    let query = {};
    if (advancePending === 'true') {
      query = { advanceReceived: false };
    }

    const bookings = await Booking.find(query).sort({ checkIn: -1 }).lean();

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
