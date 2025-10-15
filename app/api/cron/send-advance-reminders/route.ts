import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import {
  sendWhatsAppTemplate,
  formatPhoneNumber,
} from '@/lib/whatsapp';

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from a cron job service
    // You can add authorization header check here for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();

    // Fetch all bookings where advance is pending
    const pendingBookings = await Booking.find({
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
    }).lean();

    console.log(`Found ${pendingBookings.length} bookings with pending advance`);

    const results = {
      total: pendingBookings.length,
      sent: 0,
      failed: 0,
      errors: [] as Array<{ bookingId: string; bookNumber: number; error: string }>,
    };

    // Send WhatsApp messages to all pending bookings
    for (const booking of pendingBookings) {
      try {
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
          results.sent++;
          console.log(`✓ Sent reminder to booking #${booking.bookNumber}`);
        } else {
          results.failed++;
          results.errors.push({
            bookingId: booking._id.toString(),
            bookNumber: booking.bookNumber,
            error: JSON.stringify(result.error),
          });
          console.error(`✗ Failed to send reminder to booking #${booking.bookNumber}:`, result.error);
        }

        // Add a small delay between messages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        results.failed++;
        results.errors.push({
          bookingId: booking._id.toString(),
          bookNumber: booking.bookNumber,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        console.error(`✗ Error processing booking #${booking.bookNumber}:`, error);
      }
    }

    console.log(`Cron job completed: ${results.sent} sent, ${results.failed} failed`);

    return NextResponse.json({
      success: true,
      message: 'Advance reminders processed',
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
