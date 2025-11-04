import mongoose, { Schema, Model } from 'mongoose';

export interface IBooking {
  bookNumber: number;
  bookedBy: string;
  guestNames?: string;
  checkIn: Date;
  checkOut: Date;
  bookedOn: Date;
  status: string;
  rooms: number;
  persons: number;
  adults?: number;
  children?: number;
  price: string;
  commissionPercent: number;
  commissionAmount: string;
  remarks?: string;
  bookerCountry: string;
  travelPurpose?: string;
  device?: string;
  unitType: string;
  durationNights: number;
  phoneNumber: number;
  address?: string;
  advanceReceived: boolean;
  advanceAmount?: number;
  bookingStatus: 'active' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    bookNumber: {
      type: Number,
      required: true,
      unique: true,
      index: true
    },
    bookedBy: { type: String, required: true },
    guestNames: { type: String },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    bookedOn: { type: Date, required: true },
    status: { type: String, required: true },
    rooms: { type: Number, required: true },
    persons: { type: Number, required: true },
    adults: { type: Number },
    children: { type: Number },
    price: { type: String, required: true },
    commissionPercent: { type: Number, required: true },
    commissionAmount: { type: String, required: true },
    remarks: { type: String },
    bookerCountry: { type: String, required: true },
    travelPurpose: { type: String },
    device: { type: String },
    unitType: { type: String, required: true },
    durationNights: { type: Number, required: true },
    phoneNumber: { type: Number, required: true },
    address: { type: String },
    advanceReceived: { type: Boolean, default: false },
    advanceAmount: { type: Number },
    bookingStatus: { type: String, enum: ['active', 'cancelled'], default: 'active' },
  },
  {
    timestamps: true,
  }
);

const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
