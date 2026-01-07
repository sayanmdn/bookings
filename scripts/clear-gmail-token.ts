// Script to clear invalid Gmail tokens
// Run with: npx tsx scripts/clear-gmail-token.ts

import SystemSetting from '@/lib/models/SystemSettings';
import connectDB from '@/lib/mongodb';

async function clearTokens() {
    await connectDB();

    const result = await SystemSetting.deleteMany({
        key: { $in: ['gmail_refresh_token', 'gmail_refresh_token_bookings'] }
    });

    console.log(`Deleted ${result.deletedCount} token(s)`);
    console.log('Now visit http://localhost:3000/api/gmail/auth?type=transactions to re-authorize');

    process.exit(0);
}

clearTokens().catch(console.error);
