import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/lib/models/Invoice';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    const invoice = await Invoice.findById(id);

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    console.log('PATCH /api/invoices/[id] - ID:', id);
    console.log('PATCH /api/invoices/[id] - Data:', data);

    await dbConnect();

    const invoice = await Invoice.findById(id);

    if (!invoice) {
      console.error('Invoice not found:', id);
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    console.log('Found invoice:', invoice.invoiceNumber);

    // Update editable fields
    if (data.roomType !== undefined) invoice.roomType = data.roomType;
    if (data.numberOfRooms !== undefined) invoice.numberOfRooms = data.numberOfRooms;
    if (data.numberOfGuests !== undefined) invoice.numberOfGuests = data.numberOfGuests;
    if (data.pricePerNight !== undefined) invoice.pricePerNight = data.pricePerNight;
    if (data.numberOfNights !== undefined) invoice.numberOfNights = data.numberOfNights;
    
    // Recalculate total amount only if relevant fields changed
    if (
      data.numberOfRooms !== undefined || 
      data.pricePerNight !== undefined || 
      data.numberOfNights !== undefined
    ) {
      invoice.totalAmount = invoice.pricePerNight * invoice.numberOfNights * invoice.numberOfRooms;
    }

    if (data.advanceAmount !== undefined) {
      invoice.advanceAmount = data.advanceAmount;
    }

    // Always recalculate balance and status since total or advance might have changed
    const advance = invoice.advanceAmount || 0;
    invoice.balanceAmount = invoice.totalAmount - advance;

    if (invoice.balanceAmount <= 0) {
      invoice.paymentStatus = 'paid';
      // Ensure strictly 0 if negative due to overpayment logic, though business logic might vary. 
      // For now, keeping what was there or letting it be negative? 
      // Previous logic: if (invoice.balanceAmount === 0) -> 'paid'.
      // If balance < 0, it's also effectively paid (overpaid).
      // Let's stick to <= 0 implies paid.
    } else if (advance > 0) {
      invoice.paymentStatus = 'partial';
    } else {
      invoice.paymentStatus = 'pending';
    }

    if (data.remarks !== undefined) {
      invoice.remarks = data.remarks;
    }

    console.log('Saving updated invoice...');
    await invoice.save();
    console.log('Invoice saved successfully');

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update invoice' },
      { status: 500 }
    );
  }
}
