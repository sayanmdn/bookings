import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import {
  sendWhatsAppTemplate,
  formatPhoneNumber,
} from '@/lib/whatsapp';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Get booking details
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if advance is already received
    if (booking.advanceReceived) {
      return NextResponse.json(
        { error: 'Advance already received for this booking' },
        { status: 400 }
      );
    }

    // Check if booking is cancelled
    if (booking.bookingStatus === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot send message for cancelled booking' },
        { status: 400 }
      );
    }

    // Format phone number
    const phoneNumber = formatPhoneNumber(booking.phoneNumber);

    // Format dates for template
    const checkInDate = new Date(booking.checkIn).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const checkOutDate = new Date(booking.checkOut).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const guestName = booking.guestNames || booking.bookedBy;

    // Send WhatsApp template message
    const result = await sendWhatsAppTemplate({
      to: phoneNumber,
      templateName: 'advance_payment_reminder',
      languageCode: 'en',
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: guestName },
            { type: 'text', text: booking.bookNumber.toString() },
            { type: 'text', text: checkInDate },
            { type: 'text', text: checkOutDate },
            { type: 'text', text: booking.price },
          ],
        },
      ],
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'WhatsApp message sent successfully',
        data: result.data,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send WhatsApp message',
          details: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in WhatsApp send API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
