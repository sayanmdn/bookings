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

        if (tokens.refresh_token) {
            await connectDB();

            // Store the refresh token
            await SystemSetting.findOneAndUpdate(
                { key: 'gmail_refresh_token' },
                { value: tokens.refresh_token },
                { upsert: true, new: true }
            );
        } else {
            console.warn('No refresh token received. User might have previously authorized.');
            // If we don't get a refresh token, it might be because the user has already authorized
            // and we are just re-authing. If we already have one in DB, we are good. 
            // If not, we are in trouble, but the "prompt: consent" in getAuthUrl should prevent this.
        }

        // Redirect back to transactions page with a success query param
        const url = request.nextUrl.clone();
        url.pathname = '/transactions';
        url.searchParams.delete('code');
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
