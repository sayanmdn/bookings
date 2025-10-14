# Booking Management System

A Next.js web application for managing hotel/accommodation bookings with Excel file upload and advance payment tracking.

## Features

- 📤 **Drag & Drop Excel Upload** - Upload .xls/.xlsx files with booking data
- 🔄 **Smart Data Processing** - Automatically updates existing bookings and adds new ones
- 💰 **Advance Payment Tracking** - Mark and track advance payments
- 📊 **Dashboard** - View statistics and manage bookings
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure MongoDB

Your MongoDB URI is already configured in `.env.local`:
```
MONGODB_URI=mongodb+srv://sayanmdn2:jfZRELq9XhG0rquc@backend-serverless.3e0kv62.mongodb.net/?retryWrites=true&w=majority&appName=backend-serverless
```

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

Deploy to Vercel:

```bash
npm run build
```

Then deploy via Vercel CLI or connect your GitHub repo to Vercel.

Don't forget to add your environment variable `MONGODB_URI` in Vercel's project settings.
