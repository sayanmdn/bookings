import { google, gmail_v1 } from 'googleapis';
import SystemSetting from '@/lib/models/SystemSettings';
import connectDB from '@/lib/mongodb';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// The callback URL must match exactly what is in Google Cloud Console
const REDIRECT_URI = process.env.NODE_ENV === 'production'
    ? 'https://bookings-livid.vercel.app/api/gmail/callback'
    : 'http://localhost:3000/api/gmail/callback';

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

export const getOAuthClient = () => {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error('Missing Google Client ID or Secret');
    }
    // Debug log to verify what is being sent
    console.log('OAuth Config:', { CLIENT_ID: CLIENT_ID.substring(0, 10) + '...', REDIRECT_URI });

    return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
};

export const getAuthUrl = (state?: string) => {
    const oauth2Client = getOAuthClient();
    return oauth2Client.generateAuthUrl({
        access_type: 'offline', // Crucial for receiving a refresh token
        scope: SCOPES,
        prompt: 'consent', // Force consent prompt to ensure we get a refresh token
        state, // Pass state (e.g., JSON string of { type: 'bookings', returnUrl: '...' })
    });
};

export const getGmailClient = async (tokenKey: string = 'gmail_refresh_token') => {
    await connectDB();
    const setting = await SystemSetting.findOne({ key: tokenKey });

    if (!setting || !setting.value) {
        throw new Error(`Gmail refresh token not found for key: ${tokenKey}. Please authenticate first.`);
    }

    const oauth2Client = getOAuthClient();
    oauth2Client.setCredentials({ refresh_token: setting.value });

    // Test the token by attempting to refresh it
    try {
        await oauth2Client.getAccessToken();
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('invalid_grant')) {
            // Delete the invalid token from the database
            await SystemSetting.deleteOne({ key: tokenKey });

            const authType = tokenKey.includes('bookings') ? 'bookings' : 'transactions';
            throw new Error(
                `Gmail refresh token is invalid or expired. ` +
                `Please re-authorize at: /api/gmail/auth?type=${authType}`
            );
        }
        throw error;
    }

    return google.gmail({ version: 'v1', auth: oauth2Client });
};

// Helper to parse email headers
export const getHeader = (headers: gmail_v1.Schema$MessagePartHeader[], name: string) => {
    return headers.find(h => h.name === name)?.value || '';
};

// Helper to decode base64 email body
export const decodeBody = (payload: gmail_v1.Schema$MessagePart): string => {
    // 1. Check if the top-level payload has body data
    if (payload.body && payload.body.data) {
        return Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }

    // 2. If it has parts, verify if it's multipart then search recursively
    if (payload.parts) {
        for (const part of payload.parts) {
            // Priority: text/plain
            if (part.mimeType === 'text/plain') {
                if (part.body && part.body.data) {
                    return Buffer.from(part.body.data, 'base64').toString('utf-8');
                }
            }
            // If part is multipart, recurse
            if (part.mimeType?.startsWith('multipart/')) {
                const recursiveBody = decodeBody(part);
                if (recursiveBody) return recursiveBody;
            }
        }

        // If no text/plain found, try text/html as fallback (though regex might fail on HTML)
        for (const part of payload.parts) {
            if (part.mimeType === 'text/html') {
                if (part.body && part.body.data) {
                    return Buffer.from(part.body.data, 'base64').toString('utf-8');
                }
            }
        }
    }

    return '';
};
