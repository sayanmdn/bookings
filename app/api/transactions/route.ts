
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Transaction from '@/lib/models/Transaction';
import Booking from '@/lib/models/Booking'; // Ensure Booking model is registered
import Invoice from '@/lib/models/Invoice'; // Ensure Invoice model is registered
import connectDB from '@/lib/mongodb';

// Ensure models are registered to avoid Schema hasn't been registered for model "..." error
const ensureModels = () => {
    if (!mongoose.models.Booking) console.log('Booking model not registered yet');
    if (!mongoose.models.Invoice) console.log('Invoice model not registered yet');
};

export async function GET() {
    try {
        await connectDB();
        ensureModels();

        const transactions = await Transaction.find({})
            .sort({ date: -1 })
            .populate('bookingId', 'bookNumber guestNames')
            .populate('invoiceId', 'invoiceNumber guestName');

        return NextResponse.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transactions' },
            { status: 500 }
        );
    }
}
