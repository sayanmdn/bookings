import { NextResponse } from 'next/server';
import { getGmailClient, getHeader, decodeBody } from '@/lib/gmail';
import Transaction from '@/lib/models/Transaction';
import connectDB from '@/lib/mongodb';

// Function to parse the SBM Bank email body
function parseSBMTransaction(body: string, dateHeader: string) {
    // Regex to match the transaction details
    // "Your account XX5151 is credited with INR 110.00 on 28-12-2025. Info:UPI/P2P/132948538720/RANGUVEN/. The Curr bal is 59016.87."
    const amountRegex = /credited with INR\s+([\d,]+\.?\d*)/;
    const infoRegex = /Info:([^.\n]+)/;
    // We can use the date from the email header as it allows for better sorting/ISO format than parsing "28-12-2025" manually
    // But the email body date is also available: /on\s+(\d{2}-\d{2}-\d{4})/

    const amountMatch = body.match(amountRegex);
    const infoMatch = body.match(infoRegex);

    if (amountMatch) {
        const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
        const description = infoMatch ? infoMatch[1].trim() : 'SBM Bank Transaction';

        // Construct a date object. 
        // The email header date is usually reliable.
        const date = new Date(dateHeader);

        return {
            amount,
            description,
            date,
            category: 'uncategorized', // Default
            type: 'credit' as const,
            paymentMethod: 'upi', // Inferred from sample "UPI/P2P..." but could be generic
            status: 'success' as const,
        };
    }
    return null;
}

export async function GET() {
    try {
        const gmail = await getGmailClient('gmail_refresh_token');

        // List messages
        // Query specifically for SBM Bank emails to filter irrelevant ones
        // "Credit Transaction Alert" and sender "info@sbmbank.co.in" seem key
        const query = 'from:info@sbmbank.co.in subject:"Credit Transaction Alert"';
        console.log('Syncing Gmail with query:', query);

        const response = await gmail.users.messages.list({
            userId: 'me',
            q: query,
            maxResults: 5, // Get last 5 as requested
        });

        const messages = response.data.messages || [];
        console.log(`Found ${messages.length} messages.`);

        let addedCount = 0;

        await connectDB();

        for (const msg of messages) {
            if (!msg.id) continue;
            // console.log('Processing message ID:', msg.id); // Uncomment for verbose logging

            const messageDetails = await gmail.users.messages.get({
                userId: 'me',
                id: msg.id,
            });

            const payload = messageDetails.data.payload;
            if (!payload) continue;

            const headers = payload.headers || [];
            const dateHeader = getHeader(headers, 'Date');
            const body = decodeBody(payload);

            // console.log(`Message ${msg.id} Body Snippet:`, body.substring(0, 100));

            const parsedData = parseSBMTransaction(body, dateHeader);

            if (!parsedData) {
                console.log(`Failed to parse message ${msg.id}. Skipped.`);
                console.log(`MimeType: ${payload.mimeType}`);
                console.log(`Body Snippet: [${body.substring(0, 200)}]`); // Log first 200 chars to debug
            }

            if (parsedData) {
                // Check for duplicate
                console.log(`Parsed Transaction: Amount=${parsedData.amount}, Date=${parsedData.date}, Desc=${parsedData.description}`);

                // We look for a transaction with same amount, approx same date (within 1 min?), and same description.
                // Or simpler: same amount, exact same date (if we trust header date), same description.
                // SBM emails might not have unique transaction IDs easily parseable in the body, 
                // but the "Info" often contains a Reference ID (e.g. 132948538720).
                // Let's rely on that if possible, but for now strict checking on fields.

                // Improve duplicate check using the message ID? No, we might delete emails.
                // Using `description` (Info) is best as it likely contains the UTR/Ref number.

                const exists = await Transaction.findOne({
                    description: parsedData.description,
                    amount: parsedData.amount,
                    date: parsedData.date, // This might be too strict if seconds differ?
                });

                if (!exists) {
                    // Let's check looser date match if strict fails?
                    // Actually, if we use the *email timestamp* as the transaction date, it ensures consistency.
                    // So duplicate check by (Amount + Description + Date) is robust assuming Description is unique (contains UTR).

                    await Transaction.create(parsedData);
                    addedCount++;
                }
            }
        }

        return NextResponse.json({
            success: true,
            added: addedCount,
            totalProcessed: messages.length
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Sync Error:', error);

        if (errorMessage.includes('refresh token') || errorMessage.includes('re-authorize')) {
            return NextResponse.json({
                error: 'Auth Required',
                message: errorMessage,
                authUrl: '/api/gmail/auth?type=transactions'
            }, { status: 401 });
        }

        return NextResponse.json({ error: 'Failed to sync transactions' }, { status: 500 });
    }
}
