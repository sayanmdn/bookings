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

    // Update only editable fields
    if (data.advanceAmount !== undefined) {
      invoice.advanceAmount = data.advanceAmount;
      invoice.balanceAmount = invoice.totalAmount - data.advanceAmount;

      // Update payment status
      if (invoice.balanceAmount === 0) {
        invoice.paymentStatus = 'paid';
      } else if (data.advanceAmount > 0) {
        invoice.paymentStatus = 'partial';
      } else {
        invoice.paymentStatus = 'pending';
      }
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
