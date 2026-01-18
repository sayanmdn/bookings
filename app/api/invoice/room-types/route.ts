import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/lib/models/Invoice';

// Default room types that should always be available
const DEFAULT_ROOM_TYPES = [
    'Single Bed in Mixed Dormitory Room',
    'Single Bed in Female Dormitory Room',
    'Private Room',
];

export async function GET() {
    try {
        await dbConnect();

        // Get unique room types from existing invoices
        const roomTypes = await Invoice.distinct('roomType');

        // Create a Set to track unique room types
        const uniqueRoomTypes = new Set<string>();

        // Add default room types first (in order)
        DEFAULT_ROOM_TYPES.forEach((type) => uniqueRoomTypes.add(type));

        // Add room types from database (excluding defaults, they're already added)
        roomTypes.forEach((type: string) => {
            if (type && !DEFAULT_ROOM_TYPES.includes(type)) {
                uniqueRoomTypes.add(type);
            }
        });

        return NextResponse.json({ roomTypes: Array.from(uniqueRoomTypes) });
    } catch (error) {
        console.error('Error fetching room types:', error);
        return NextResponse.json(
            { error: 'Failed to fetch room types' },
            { status: 500 }
        );
    }
}
