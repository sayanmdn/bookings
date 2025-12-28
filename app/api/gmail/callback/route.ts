import { NextRequest, NextResponse } from 'next/server';
import { getOAuthClient } from '@/lib/gmail';
import SystemSetting from '@/lib/models/SystemSettings';
import connectDB from '@/lib/mongodb';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.json({ error }, { status: 400 });
    }

    if (!code) {
        return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    try {
        const oauth2Client = getOAuthClient();
        const { tokens } = await oauth2Client.getToken(code);

        // Parse state to get type
        const stateParam = searchParams.get('state');
        let type = 'transactions';
        if (stateParam) {
            try {
                const state = JSON.parse(stateParam);
                if (state.type) type = state.type;
            } catch (e) {
                console.warn('Failed to parse state param:', stateParam);
            }
        }

        const tokenKey = type === 'bookings' ? 'gmail_refresh_token_bookings' : 'gmail_refresh_token';

        if (tokens.refresh_token) {
            await connectDB();

            // Store the refresh token with the specific key
            await SystemSetting.findOneAndUpdate(
                { key: tokenKey },
                { value: tokens.refresh_token },
                { upsert: true, new: true }
            );
            console.log(`Saved refresh token for ${type} (key: ${tokenKey})`);
        } else {
            console.warn('No refresh token received. User might have previously authorized.');
        }

        // Redirect back to the correct page
        const url = request.nextUrl.clone();
        url.pathname = type === 'bookings' ? '/bookings' : '/transactions';
        url.searchParams.delete('code');
        url.searchParams.delete('state');
        url.searchParams.set('gmail_sync', 'connected');

        return NextResponse.redirect(url);

    } catch (err) {
        console.error('Error exchanging code for token:', err);
        return NextResponse.json(
            { error: 'Failed to authenticate with Google' },
            { status: 500 }
        );
    }
}
