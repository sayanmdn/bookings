import mongoose, { Schema, Model } from 'mongoose';

export interface ITransaction {
    amount: number;
    type: 'credit' | 'debit';
    category: string;
    description?: string;
    date: Date;
    bookingId?: mongoose.Types.ObjectId;
    invoiceId?: mongoose.Types.ObjectId;
    paymentMethod: string;
    status: 'success' | 'pending' | 'failed';
    createdAt?: Date;
    updatedAt?: Date;
}

const TransactionSchema = new Schema<ITransaction>(
    {
        amount: {
            type: Number,
            required: true,
        },
        type: {
            type: String,
            enum: ['credit', 'debit'],
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        date: {
            type: Date,
            default: Date.now,
            required: true,
        },
        bookingId: {
            type: Schema.Types.ObjectId,
            ref: 'Booking',
        },
        invoiceId: {
            type: Schema.Types.ObjectId,
            ref: 'Invoice',
        },
        paymentMethod: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['success', 'pending', 'failed'],
            default: 'success',
        },
    },
    {
        timestamps: true,
    }
);

const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
