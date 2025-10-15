# WhatsApp Automated Reminder Setup

This document explains how to set up automated WhatsApp messages for advance payment reminders.

## Prerequisites

1. **WhatsApp Business API Account**
   - You need a Meta Business Account
   - WhatsApp Business API access
   - Phone Number ID from Meta Business Manager

2. **Environment Variables**
   - `WHATSAPP_ACCESS_TOKEN`: Your WhatsApp Business API access token (already configured)
   - `WHATSAPP_PHONE_NUMBER_ID`: Your WhatsApp Phone Number ID from Meta Business Manager
   - `CRON_SECRET`: A secure random string to protect the cron endpoint

## Configuration Steps

### 1. Get WhatsApp Phone Number ID

1. Go to [Meta Business Manager](https://business.facebook.com/)
2. Navigate to WhatsApp > API Setup
3. Copy your Phone Number ID
4. Update `.env.local`:
   ```
   WHATSAPP_PHONE_NUMBER_ID=your_actual_phone_number_id
   ```

### 2. Set Cron Secret

Generate a secure random string for the cron secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Update `.env.local`:
```
CRON_SECRET=your_generated_secure_string
```

### 3. Set Up Cron Job

You have multiple options to schedule the cron job to run daily at 8PM IST:

#### Option A: Vercel Cron Jobs (Recommended for Production)

1. Create `vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-advance-reminders",
      "schedule": "0 14 30 * * *"
    }
  ]
}
```

Note: The schedule "0 14 30 * * *" means 2:30 PM UTC, which is 8:00 PM IST (UTC+5:30)

2. Deploy to Vercel
3. Vercel will automatically execute the cron job at the specified time

#### Option B: GitHub Actions

Create `.github/workflows/whatsapp-reminders.yml`:

```yaml
name: WhatsApp Advance Reminders

on:
  schedule:
    # Runs at 14:30 UTC (8:00 PM IST) every day
    - cron: '30 14 * * *'
  workflow_dispatch: # Allows manual trigger

jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Send WhatsApp Reminders
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-domain.com/api/cron/send-advance-reminders
```

Add `CRON_SECRET` to your GitHub repository secrets.

#### Option C: External Cron Service (cron-job.org, EasyCron, etc.)

1. Sign up for a cron service like [cron-job.org](https://cron-job.org/)
2. Create a new cron job:
   - **URL**: `https://your-domain.com/api/cron/send-advance-reminders`
   - **Schedule**: Daily at 20:00 IST (14:30 UTC)
   - **HTTP Method**: GET
   - **Headers**: Add `Authorization: Bearer YOUR_CRON_SECRET`

#### Option D: Manual Setup with Linux Crontab (Self-hosted)

If you're self-hosting, add to your crontab:

```bash
# Edit crontab
crontab -e

# Add this line (runs at 8:00 PM IST daily)
30 14 * * * curl -X GET -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-domain.com/api/cron/send-advance-reminders
```

## API Endpoints

### 1. Send Individual Message

**Endpoint**: `POST /api/whatsapp/send`

**Request Body**:
```json
{
  "bookingId": "mongodb_booking_id"
}
```

**Response**:
```json
{
  "success": true,
  "message": "WhatsApp message sent successfully",
  "data": {
    "messaging_product": "whatsapp",
    "contacts": [...],
    "messages": [...]
  }
}
```

### 2. Automated Cron Job (All Pending Bookings)

**Endpoint**: `GET /api/cron/send-advance-reminders`

**Headers**:
```
Authorization: Bearer YOUR_CRON_SECRET
```

**Response**:
```json
{
  "success": true,
  "message": "Advance reminders processed",
  "results": {
    "total": 10,
    "sent": 8,
    "failed": 2,
    "errors": [...]
  },
  "timestamp": "2025-10-15T14:30:00.000Z"
}
```

## Message Template

The automated message sent to customers looks like this:

```
Dear [Guest Name],

This is a friendly reminder regarding your booking at Pathfinders Nest.

Booking Details:
📌 Booking Number: #[Book Number]
📅 Check-in: [Check-in Date]
📅 Check-out: [Check-out Date]
💰 Total Amount: ₹[Price]

We are yet to receive the advance payment for your booking. Please make the advance payment at your earliest convenience to confirm your reservation.

For payment details or any queries, please contact us.

Thank you,
Pathfinders Nest
```

## Testing

### Test Individual Message

```bash
curl -X POST http://localhost:3000/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{"bookingId": "your_booking_id"}'
```

### Test Cron Job (Locally)

```bash
curl -X GET http://localhost:3000/api/cron/send-advance-reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Phone Number Format

Phone numbers are automatically formatted to international format:
- Input: `9876543210` → Output: `919876543210` (adds India country code)
- Input: `919876543210` → Output: `919876543210` (already formatted)

If your customers are from other countries, the `formatPhoneNumber` function in `lib/whatsapp.ts` may need adjustment.

## Important Notes

1. **WhatsApp Business API Limits**:
   - Free tier has messaging limits
   - Conversation windows apply (24-hour window after user message)
   - Template messages may require Meta approval

2. **Rate Limiting**:
   - The cron job adds a 1-second delay between messages
   - Adjust if needed in `app/api/cron/send-advance-reminders/route.ts`

3. **Security**:
   - Always use the `CRON_SECRET` to protect the cron endpoint
   - Never expose your WhatsApp access token
   - Use environment variables for all sensitive data

4. **Monitoring**:
   - Check the cron job execution logs regularly
   - Monitor the `results` object for failed messages
   - Set up alerts for high failure rates

## Troubleshooting

### Messages Not Sending

1. Verify `WHATSAPP_PHONE_NUMBER_ID` is correct
2. Check WhatsApp access token is valid (they expire after 60 days by default)
3. Ensure phone numbers are in correct format
4. Check WhatsApp Business API status

### Cron Job Not Running

1. Verify the cron schedule is correct (convert to UTC for IST)
2. Check `CRON_SECRET` is set correctly
3. Verify the authorization header in the cron service
4. Check application logs for errors

### Rate Limiting Errors

1. Increase delay between messages in cron job
2. Check your WhatsApp API tier limits
3. Consider batching messages across multiple time slots

## Support

For issues related to:
- WhatsApp Business API: [Meta Business Support](https://business.facebook.com/help)
- Application issues: Check application logs and error messages
