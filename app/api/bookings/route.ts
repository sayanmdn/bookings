import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { UserRole } from '@/lib/types/user';
import dbConnect from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check authorization - EDITOR or ADMIN only
    if (![UserRole.EDITOR, UserRole.ADMIN].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const advancePending = searchParams.get('advancePending');

    let query = {};
    if (advancePending === 'true') {
      query = { advanceReceived: false };
    }

    const bookings = await Booking.find(query).sort({ checkIn: 1 }).lean();

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
