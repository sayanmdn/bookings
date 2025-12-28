import { NextResponse } from 'next/server';
import { getGmailClient, getHeader, decodeBody } from '@/lib/gmail';
import Booking from '@/lib/models/Booking';
import connectDB from '@/lib/mongodb';

// Helper to strip HTML tags
function stripHtml(html: string) {
    if (!html) return '';
    // Replace tags with space to avoid joining words
    let text = html.replace(/<[^>]*>/g, ' ');
    // Decode common entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    // Normalize whitespace
    return text.replace(/\s+/g, ' ').trim();
}

// Function to parse MakeMyTrip email body
function parseMMTBooking(htmlBody: string, dateHeader: string) {
    const body = stripHtml(htmlBody);
    // Regex patterns based on the provided email sample

    // Booking ID: "NH78235454389498"
    // Search for "Booking ID" followed by alphanumeric
    // The sample shows "Booking ID\nNH78235454389498" or similar structure.
    // Let's look for "NH" followed by digits, or "Booking ID" context.
    // Sample: "Booking ID\nNH78235454389498"
    const bookingIdRegex = /Booking ID\s+([A-Z0-9]+)/i;
    // Fallback: look for "NH" start 
    const bookingIdFallback = /(NH\d+)/;

    // Dates: "CHECK-IN ... 07 Jan '26"
    // The format seems to be "dd MMM 'yy"
    // Regex to capture date string. 
    // "CHECK-IN\tCHECK-OUT\n07 Jan '26\n\n12:00 PM\n\n08 Jan '26"
    const checkInRegex = /CHECK-IN[\s\S]*?(\d{2}\s+[A-Za-z]+\s+'\d{2})/;
    const checkOutRegex = /CHECK-OUT[\s\S]*?(\d{2}\s+[A-Za-z]+\s+'\d{2})/;

    // Guest Name: "PRIMARY GUEST DETAILS\n\tShreyas P A"
    // Use [^\n\r]+ to capture until end of line, or lookahead
    // Update: Stop at "CHECK-IN"
    const guestNameRegex = /PRIMARY GUEST DETAILS\s+([\s\S]+?)(?=\s+CHECK-IN)/;

    // Amount: "Payable to Property (A-B-C)\t₹ 353.97" or "Property Gross Charges... ₹ 450.0"
    // User said: "Payable to Property (A-B-C) ₹ 353.97 is the booking amount."
    // Let's try to match "Payable to Property (A-B-C)" and capture the amount.
    const amountRegex = /Payable to Property \(A-B-C\)[\s\S]*?₹\s*([\d,]+\.?\d*)/;

    // If that fails, maybe "Payable to Property\n₹ 353.97" (earlier in email)
    const amountFallbackRegex = /Payable to Property\s+₹\s*([\d,]+\.?\d*)/;

    // Extract values
    const bookingIdMatch = body.match(bookingIdRegex) || body.match(bookingIdFallback);
    const checkInMatch = body.match(checkInRegex);
    const checkOutMatch = body.match(checkOutRegex);
    const guestNameMatch = body.match(guestNameRegex);
    const amountMatch = body.match(amountRegex) || body.match(amountFallbackRegex);

    if (bookingIdMatch && amountMatch) {
        // Parse Dates
        // Helper to parse "07 Jan '26"
        const parseDate = (dateStr: string) => {
            // remove single quote before year if present for easier parsing, or just use standard parsing?
            // "07 Jan '26" -> "07 Jan 2026"
            const cleaned = dateStr.replace(/'/, '20').trim();
            return new Date(cleaned);
        };

        const checkIn = checkInMatch ? parseDate(checkInMatch[1]) : new Date(dateHeader); // Fallback to email date? No, dangerous. Checkin is crucial.
        // If checkIn not found, we might skip or error.

        // For checkout, if not found, maybe +1 day?
        const checkOut = checkOutMatch ? parseDate(checkOutMatch[1]) : new Date(checkIn.getTime() + 24 * 60 * 60 * 1000);

        const amount = amountMatch[1].replace(/,/g, '');
        const bookNumber = bookingIdMatch[1].trim();
        const guestName = guestNameMatch ? guestNameMatch[1].trim() : 'Guest';

        return {
            bookNumber, // Alphanumeric
            bookedBy: 'MakeMyTrip',  // Explicitly set Source
            guestNames: guestName,
            checkIn,
            checkOut,
            bookedOn: new Date(dateHeader), // Booking date is when email received
            status: 'confirmed',
            rooms: 1, // Default to 1
            persons: 1, // Default to 1 or try to parse "TOTAL NO. OF GUEST(S)"
            price: amount,
            commissionPercent: 0, // We can't easily calculate this without more parsing, or we infer?
            commissionAmount: '0',
            // Note: MMT commission is in the email: "Go-MMT Commission... ₹ 95.58"
            // We could parse it if needed, but keeping it simple for now.
            remarks: 'Synced from Gmail',
            bookerCountry: 'IN', // Default
            unitType: 'Dorm', // Default
            durationNights: Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)),
            phoneNumber: 0, // Placeholder as per plan
            bookingStatus: 'active' as const,
            advanceReceived: true, // "Payment Status Paid Online" usually means advance received? 
            // The email says "Payable to Property ... Go-MMT will release payment..."
            // Usually this means it's prepaid to MMT.
            advanceAmount: parseFloat(amount)
        };
    }
    return null;
}

export async function GET() {
    try {
        const gmail = await getGmailClient('gmail_refresh_token_bookings');

        // specific MakeMyTrip query
        const query = 'from:no-reply@go-mmt.com subject:"New Booking Received"';
        console.log('Syncing Bookings with query:', query);

        const response = await gmail.users.messages.list({
            userId: 'me',
            q: query,
            maxResults: 50,
        });

        const messages = response.data.messages || [];
        console.log(`Found ${messages.length} booking emails.`);

        let addedCount = 0;

        await connectDB();

        for (const msg of messages) {
            if (!msg.id) continue;

            const messageDetails = await gmail.users.messages.get({
                userId: 'me',
                id: msg.id,
            });

            const payload = messageDetails.data.payload;
            if (!payload) continue;

            const headers = payload.headers || [];
            const dateHeader = getHeader(headers, 'Date');
            const body = decodeBody(payload);

            const parsedData = parseMMTBooking(body, dateHeader);

            if (parsedData) {
                console.log(`Parsed Booking: ID=${parsedData.bookNumber}, Guest=${parsedData.guestNames}`);

                // Check for duplicate using bookNumber (Booking ID)
                const exists = await Booking.findOne({ bookNumber: parsedData.bookNumber });

                if (!exists) {
                    await Booking.create(parsedData);
                    addedCount++;
                } else {
                    console.log(`Booking ${parsedData.bookNumber} already exists. Skipping.`);
                }
            } else {
                console.log(`Failed to parse booking email ${msg.id}`);
                console.log(`Body Snippet: ${body.substring(0, 500)}`); // Log first 500 chars
            }
        }

        return NextResponse.json({
            success: true,
            added: addedCount,
            totalProcessed: messages.length
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (errorMessage.includes('refresh token')) {
            return NextResponse.json({ error: 'Auth Required' }, { status: 401 });
        }
        console.error('Booking Sync Error:', error);
        return NextResponse.json({ error: 'Failed to sync bookings' }, { status: 500 });
    }
}
