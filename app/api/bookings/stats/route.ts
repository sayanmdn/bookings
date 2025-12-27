import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Booking from '@/lib/models/Booking'

export async function GET() {
    try {
        await dbConnect()

        // Get total bookings
        const total = await Booking.countDocuments({})

        // Count pending advance (where advanceReceived is false or doesn't exist, and booking is active or field doesn't exist)
        const pending = await Booking.countDocuments({
            $and: [
                {
                    $or: [
                        { advanceReceived: false },
                        { advanceReceived: { $exists: false } }
                    ]
                },
                {
                    $or: [
                        { bookingStatus: 'active' },
                        { bookingStatus: { $exists: false } }
                    ]
                }
            ]
        })

        // Count active advance received (where advanceReceived is true and checkout not passed)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const received = await Booking.countDocuments({
            advanceReceived: true,
            checkOut: { $gte: today },
            $or: [
                { bookingStatus: 'active' },
                { bookingStatus: { $exists: false } }
            ]
        })

        return NextResponse.json({
            total,
            pending,
            received,
        })
    } catch (error) {
        console.error('Error fetching stats:', error)
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        )
    }
}
