import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { UserRole } from '@/lib/models/DefaultUser';
import dbConnect from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();

    const updateData: { advanceReceived?: boolean; advanceAmount?: number; bookingStatus?: 'active' | 'cancelled' } = {};

    if (body.advanceReceived !== undefined) {
      updateData.advanceReceived = body.advanceReceived;
    }

    if (body.advanceAmount !== undefined) {
      updateData.advanceAmount = body.advanceAmount;
    }

    if (body.bookingStatus !== undefined) {
      updateData.bookingStatus = body.bookingStatus;
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const booking = await Booking.findByIdAndUpdate(
      id,
      { bookingStatus: 'cancelled' },
      { new: true }
    );

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Booking cancelled successfully', booking });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
