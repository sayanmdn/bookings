import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('query');

        let filter = {};
        if (query) {
            filter = {
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } },
                ],
            };
        }

        const users = await User.find(filter).select('-__v').sort({ createdAt: -1 });

        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
