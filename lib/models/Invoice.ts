import mongoose, { Schema, Model } from 'mongoose';

export interface IInvoice {
  _id?: mongoose.Types.ObjectId;
  invoiceNumber: string;
  title: string;
  guestName: string;
  checkIn: Date;
  checkOut: Date;
  roomType: string;
  numberOfRooms: number;
  numberOfGuests: number;
  pricePerNight: number;
  numberOfNights: number;
  totalAmount: number;
  advanceAmount?: number;
  balanceAmount?: number;
  paymentStatus: 'paid' | 'pending' | 'partial';
  remarks?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    title: { type: String, default: 'PATHFINDERS NEST' },
    guestName: { type: String, required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    roomType: { type: String, required: true },
    numberOfRooms: { type: Number, required: true },
    numberOfGuests: { type: Number, required: true },
    pricePerNight: { type: Number, required: true },
    numberOfNights: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    advanceAmount: { type: Number },
    balanceAmount: { type: Number },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'partial'],
      default: 'pending'
    },
    remarks: { type: String },
  },
  {
    timestamps: true,
  }
);

const Invoice: Model<IInvoice> = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);

export default Invoice;
