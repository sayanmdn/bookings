import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { UserRole } from '@/lib/types/user';
import * as XLSX from 'xlsx';
import dbConnect from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import { CheckinBooking } from '@/lib/types';

export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Read the file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data: CheckinBooking[] = XLSX.utils.sheet_to_json(sheet);

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'No data found in Excel file' }, { status: 400 });
    }

    // Connect to database
    await dbConnect();

    let added = 0;
    let updated = 0;
    let skipped = 0;

    // Process each booking
    for (const row of data) {
      try {
        const bookNumber = row['Book number'];

        if (!bookNumber) {
          skipped++;
          continue;
        }

        // Check if booking already exists
        const existingBooking = await Booking.findOne({ bookNumber });

        // Map Excel data to database schema
        const bookingData = {
          bookNumber: row['Book number'],
          bookedBy: row['Booked by'],
          guestNames: row['Guest name(s)'],
          checkIn: new Date(row['Check-in']),
          checkOut: new Date(row['Check-out']),
          bookedOn: new Date(row['Booked on']),
          status: row['Status'],
          rooms: row['Rooms'],
          persons: row['Persons'],
          adults: row['Adults'],
          children: row['Children'],
          price: row['Price'],
          commissionPercent: row['Commission %'],
          commissionAmount: row['Commission amount'],
          remarks: row['Remarks'],
          bookerCountry: row['Booker country'],
          travelPurpose: row['Travel purpose'],
          device: row['Device'],
          unitType: row['Unit type'],
          durationNights: row['Duration (nights)'],
          phoneNumber: row['Phone number'],
          address: row['Address'],
        };

        if (existingBooking) {
          // Update existing booking but preserve advanceReceived status
          await Booking.findOneAndUpdate(
            { bookNumber },
            { ...bookingData, advanceReceived: existingBooking.advanceReceived },
            { new: true }
          );
          updated++;
        } else {
          // Create new booking
          await Booking.create({ ...bookingData, advanceReceived: false });
          added++;
        }
      } catch (error) {
        console.error(`Error processing booking ${row['Book number']}:`, error);
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      added,
      updated,
      skipped,
      total: data.length,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
