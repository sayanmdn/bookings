import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/gmail';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get('type') || 'transactions'; // Default to transactions for backward compatibility

        const state = JSON.stringify({ type });
        const url = getAuthUrl(state);

        console.log('--- Gmail Auth Debug ---');
        console.log('Generated Auth URL:', url);
        console.log('Type:', type);
        const urlObj = new URL(url);
        console.log('Redirect URI param:', urlObj.searchParams.get('redirect_uri'));
        console.log('Client ID param:', urlObj.searchParams.get('client_id'));
        console.log('NODE_ENV:', process.env.NODE_ENV);
        console.log('------------------------');
        return NextResponse.redirect(url);
    } catch (error) {
        console.error('Error generating auth URL:', error);
        return NextResponse.json(
            { error: 'Failed to generate authentication URL' },
            { status: 500 }
        );
    }
}
