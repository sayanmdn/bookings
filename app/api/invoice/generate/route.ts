import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { UserRole } from '@/lib/models/DefaultUser';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import InvoiceTemplate from '@/components/InvoiceTemplate';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/lib/models/Invoice';

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

    const data = await request.json();

    // Validate required fields
    const requiredFields = ['guestName', 'checkIn', 'checkOut', 'roomType', 'numberOfRooms', 'numberOfGuests', 'pricePerNight'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Calculate number of nights
    const checkIn = new Date(data.checkIn);
    const checkOut = new Date(data.checkOut);
    const numberOfNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate amounts
    const totalAmount = data.pricePerNight * numberOfNights;
    const advanceAmount = data.advanceAmount || 0;
    const balanceAmount = totalAmount - advanceAmount;

    // Generate invoice number
    await dbConnect();
    const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
    const lastNumber = lastInvoice ? parseInt(lastInvoice.invoiceNumber.split('-')[1]) : 0;
    const invoiceNumber = `INV-${String(lastNumber + 1).padStart(5, '0')}`;

    // Save invoice to database
    const invoice = await Invoice.create({
      invoiceNumber,
      guestName: data.guestName,
      checkIn: checkIn,
      checkOut: checkOut,
      roomType: data.roomType,
      numberOfRooms: data.numberOfRooms,
      numberOfGuests: data.numberOfGuests,
      pricePerNight: data.pricePerNight,
      numberOfNights,
      totalAmount,
      advanceAmount,
      balanceAmount,
      paymentStatus: balanceAmount === 0 ? 'paid' : advanceAmount > 0 ? 'partial' : 'pending',
      remarks: data.remarks || '',
    });

    // Prepare data for PDF
    const pdfData = {
      invoiceNumber: invoice.invoiceNumber,
      guestName: invoice.guestName,
      checkIn: invoice.checkIn.toISOString(),
      checkOut: invoice.checkOut.toISOString(),
      roomType: invoice.roomType,
      numberOfRooms: invoice.numberOfRooms,
      numberOfGuests: invoice.numberOfGuests,
      pricePerNight: invoice.pricePerNight,
      numberOfNights: invoice.numberOfNights,
      totalAmount: invoice.totalAmount,
      advanceAmount: invoice.advanceAmount,
      balanceAmount: invoice.balanceAmount,
      remarks: invoice.remarks,
    };

    // Generate PDF
    // @ts-expect-error - InvoiceTemplate returns a valid Document component
    const pdfBuffer = await renderToBuffer(React.createElement(InvoiceTemplate, { data: pdfData }));

    // Return PDF
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}
