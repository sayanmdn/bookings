import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/lib/models/Invoice';

export async function GET() {
    try {
        await dbConnect();

        // Get unique titles from existing invoices
        const titles = await Invoice.distinct('title');

        // Ensure "PATHFINDERS NEST" is always included as the default
        const defaultTitle = 'PATHFINDERS NEST';
        if (!titles.includes(defaultTitle)) {
            titles.unshift(defaultTitle);
        } else {
            // Move default to the front if it exists
            const index = titles.indexOf(defaultTitle);
            if (index > 0) {
                titles.splice(index, 1);
                titles.unshift(defaultTitle);
            }
        }

        return NextResponse.json({ titles });
    } catch (error) {
        console.error('Error fetching invoice titles:', error);
        return NextResponse.json(
            { error: 'Failed to fetch titles' },
            { status: 500 }
        );
    }
}
