// WhatsApp Business API utility functions

const WHATSAPP_API_URL = 'https://graph.facebook.com/v21.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';

export interface WhatsAppMessageParams {
  to: string; // Phone number in international format (e.g., 919876543210)
  message: string;
}

export interface WhatsAppTemplateParams {
  to: string;
  templateName: string;
  languageCode?: string;
  components?: Array<{
    type: string;
    parameters: Array<{
      type: string;
      text: string;
    }>;
  }>;
}

/**
 * Send a text message via WhatsApp Business API
 */
export async function sendWhatsAppMessage({ to, message }: WhatsAppMessageParams) {
  try {
    const response = await fetch(`${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: {
          preview_url: false,
          body: message,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`WhatsApp API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return { success: false, error };
  }
}

/**
 * Send a template message via WhatsApp Business API
 * Template messages must be pre-approved by Meta
 */
export async function sendWhatsAppTemplate({
  to,
  templateName,
  languageCode = 'en',
  components = []
}: WhatsAppTemplateParams) {
  try {
    const response = await fetch(`${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode,
          },
          components: components,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`WhatsApp API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error sending WhatsApp template:', error);
    return { success: false, error };
  }
}

/**
 * Format phone number to international format for WhatsApp
 * Removes special characters and ensures it starts with country code
 */
export function formatPhoneNumber(phoneNumber: string | number): string {
  // Convert to string and remove all non-numeric characters
  const cleaned = String(phoneNumber).replace(/\D/g, '');

  // If number doesn't start with country code, assume India (+91)
  if (!cleaned.startsWith('91') && cleaned.length === 10) {
    return `91${cleaned}`;
  }

  return cleaned;
}

/**
 * Generate advance payment reminder message
 */
export function generateAdvanceReminderMessage(booking: {
  bookNumber: number;
  bookedBy: string;
  guestNames?: string;
  checkIn: Date;
  checkOut: Date;
  price: string;
}): string {
  const checkInDate = new Date(booking.checkIn).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const checkOutDate = new Date(booking.checkOut).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const guestName = booking.guestNames || booking.bookedBy;

  return `Dear ${guestName},

This is a friendly reminder regarding your booking at Pathfinders Nest.

Booking Details:
📌 Booking Number: #${booking.bookNumber}
📅 Check-in: ${checkInDate}
📅 Check-out: ${checkOutDate}
💰 Total Amount: ₹${booking.price}

We are yet to receive the advance payment for your booking. Please make the advance payment at your earliest convenience to confirm your reservation.

For payment details or any queries, please contact us.

Thank you,
Pathfinders Nest`;
}
