# Booking Management System

A Next.js web application for managing hotel/accommodation bookings with Excel file upload and advance payment tracking.

## Features

- 🔐 **Google SSO Authentication** - Secure login with Google accounts
- 📤 **Drag & Drop Excel Upload** - Upload .xls/.xlsx files with booking data
- 🔄 **Smart Data Processing** - Automatically updates existing bookings and adds new ones
- 💰 **Advance Payment Tracking** - Mark and track advance payments
- 📊 **Dashboard** - View statistics and manage bookings
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🛡️ **Protected Routes** - All pages secured with authentication middleware

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Update `.env.local` with your credentials:
```env
MONGODB_URI=your-mongodb-connection-string
NEXT_TELEMETRY_DISABLED=1

# NextAuth Configuration
AUTH_SECRET=generate-using-openssl-rand-base64-32
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**🔐 For Google SSO Setup:** See [GOOGLE_SSO_SETUP.md](GOOGLE_SSO_SETUP.md) for detailed instructions.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Pages

- **Home (`/`)** - Dashboard with upload functionality and statistics
- **Advance Pending (`/advance-pending`)** - View bookings awaiting advance payment
- **All Bookings (`/bookings`)** - Complete list of all bookings

## Excel File Format

Your Excel file should have these columns:

- Book number
- Booked by
- Guest name(s)
- Check-in
- Check-out
- Booked on
- Status
- Rooms
- Persons
- Adults
- Children
- Price
- Commission %
- Commission amount
- Remarks
- Booker country
- Travel purpose
- Device
- Unit type
- Duration (nights)
- Phone number
- Address

## How It Works

1. **Upload Excel File** - Drag and drop or click to upload your booking Excel file
2. **Automatic Processing** - The system:
   - Checks for duplicate booking numbers
   - Updates existing bookings with new data
   - Adds new bookings
   - Preserves advance payment status
3. **Manage Advances** - Mark bookings as received on the "Advance Pending" page
4. **View All Data** - Check all bookings with their advance payment status

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: MongoDB Atlas with Mongoose
- **Styling**: Tailwind CSS
- **File Processing**: xlsx
- **Icons**: Lucide React
- **File Upload**: react-dropzone

## Deployment

### Deploy to Vercel:

1. Push your code to GitHub (make sure `.env.local` is not committed)

2. Go to [Vercel](https://vercel.com) and import your repository

3. Add the following environment variables in Vercel's project settings:
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `NEXT_TELEMETRY_DISABLED` - Set to `1`
   - `AUTH_SECRET` - Generate using `openssl rand -base64 32`
   - `GOOGLE_CLIENT_ID` - From Google Cloud Console
   - `GOOGLE_CLIENT_SECRET` - From Google Cloud Console

4. Deploy! Vercel will automatically build and deploy your app

5. **Important:** After deployment, update your Google OAuth redirect URIs with your Vercel URL

### Environment Variables Required:
- `MONGODB_URI` - MongoDB connection string (required)
- `NEXT_TELEMETRY_DISABLED` - Set to `1` to disable telemetry
- `AUTH_SECRET` - Secret key for NextAuth (required)
- `GOOGLE_CLIENT_ID` - Google OAuth Client ID (required)
- `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret (required)

### Build Command:
```bash
npm run build
```

The app will now build successfully on Vercel without hanging on telemetry prompts.
