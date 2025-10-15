# WhatsApp Message Template Setup Guide

## Important: WhatsApp Business API Requires Templates

WhatsApp Business API **DOES NOT** allow sending free-form messages to customers unless they message you first. To send automated reminders, you **MUST** use approved Message Templates.

## Step-by-Step Template Creation

### Step 1: Access WhatsApp Manager

1. Go to [Meta Business Manager](https://business.facebook.com/)
2. Select your business account
3. In the left sidebar, navigate to **WhatsApp Manager**
4. Click on **Message templates**

### Step 2: Create New Template

1. Click the **Create template** button
2. Fill in the template details:

#### Basic Information:
- **Category**: Select **"Utility"** (for transactional/booking updates)
- **Name**: `advance_payment_reminder` (exactly this name, no spaces, lowercase)
- **Languages**: Select **English**

#### Template Content:

**Header (Optional)**: Leave blank or add:
```
Pathfinders Nest - Booking Reminder
```

**Body** (Required):
```
Dear {{1}},

This is a friendly reminder regarding your booking at Pathfinders Nest.

Booking Details:
📌 Booking Number: #{{2}}
📅 Check-in: {{3}}
📅 Check-out: {{4}}
💰 Total Amount: ₹{{5}}

We are yet to receive the advance payment for your booking. Please make the advance payment at your earliest convenience to confirm your reservation.

For payment details or any queries, please contact us.

Thank you,
Pathfinders Nest
```

**Footer (Optional)**: Leave blank or add:
```
Pathfinders Nest
```

**Buttons (Optional)**: You can add buttons like:
- **Call us**: Add your phone number
- **Visit website**: Add your website URL

### Step 3: Add Sample Content

Meta requires sample data to review your template. Fill in:

1. **{{1}}** (Guest Name): `John Doe`
2. **{{2}}** (Booking Number): `12345`
3. **{{3}}** (Check-in Date): `15 Oct 2025`
4. **{{4}}** (Check-out Date): `17 Oct 2025`
5. **{{5}}** (Total Amount): `5000`

### Step 4: Submit for Review

1. Click **Submit** button
2. Meta will review your template (usually takes 1-24 hours)
3. You'll receive an email when it's approved

### Step 5: Verify Template Name

Once approved, go back to **Message templates** and verify:
- The template name is exactly: `advance_payment_reminder`
- The status shows **"Approved"**
- The language is **English (en)**

## After Template Approval

Once your template is approved:

1. **Restart your development server** if it's running
2. Test by clicking the WhatsApp button on any booking
3. The message will now be sent successfully!

## Template Variables Mapping

The code automatically fills in these variables:

| Variable | Value | Example |
|----------|-------|---------|
| {{1}} | Guest Name (or Booked By) | "John Doe" |
| {{2}} | Booking Number | "12345" |
| {{3}} | Check-in Date | "15 Oct 2025" |
| {{4}} | Check-out Date | "17 Oct 2025" |
| {{5}} | Total Price | "5000" |

## Alternative: Testing Without Template (Development Only)

If you want to test immediately without waiting for approval, you can:

1. Use WhatsApp's test number feature in the Meta Business Manager
2. Or have the recipient message your business number first (opens 24-hour window)

## Common Issues

### Template Not Found Error
- **Error**: Template name doesn't match
- **Solution**: Ensure template name is exactly `advance_payment_reminder`

### Template Not Approved
- **Error**: Template status is pending
- **Solution**: Wait for Meta approval (1-24 hours)

### Invalid Template Parameters
- **Error**: Wrong number of parameters
- **Solution**: Ensure exactly 5 parameters in the body

## Need Help?

If you encounter issues:
1. Check template status in WhatsApp Manager
2. Verify template name spelling
3. Ensure all 5 variables are properly filled
4. Check server logs for detailed error messages

## Template Preview

When approved and sent, customers will receive:

```
Dear John Doe,

This is a friendly reminder regarding your booking at Pathfinders Nest.

Booking Details:
📌 Booking Number: #12345
📅 Check-in: 15 Oct 2025
📅 Check-out: 17 Oct 2025
💰 Total Amount: ₹5000

We are yet to receive the advance payment for your booking. Please make the advance payment at your earliest convenience to confirm your reservation.

For payment details or any queries, please contact us.

Thank you,
Pathfinders Nest
```
