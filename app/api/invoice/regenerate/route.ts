import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import InvoiceTemplate from '@/components/InvoiceTemplate';

export async function POST(request: NextRequest) {
  try {
    const pdfData = await request.json();

    // Generate PDF
    // @ts-expect-error - InvoiceTemplate returns a valid Document component
    const pdfBuffer = await renderToBuffer(React.createElement(InvoiceTemplate, { data: pdfData }));

    // Return PDF
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${pdfData.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error regenerating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate invoice' },
      { status: 500 }
    );
  }
}
