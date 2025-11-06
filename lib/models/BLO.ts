import mongoose, { Schema, Model } from 'mongoose';

export interface IBLO {
  district: string;
  acNumber: string;
  assemblyName: string;
  partNo: string;
  partName: string;
  bloName: string;
  mobileNumber: string;
  designation: string;
  departmentName: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const BLOSchema = new Schema<IBLO>(
  {
    district: {
      type: String,
      required: true,
      index: true
    },
    acNumber: {
      type: String,
      required: true,
      index: true
    },
    assemblyName: {
      type: String,
      required: true,
      index: true
    },
    partNo: {
      type: String,
      required: true
    },
    partName: {
      type: String,
      required: true
    },
    bloName: {
      type: String,
      required: true,
      index: true
    },
    mobileNumber: {
      type: String,
      required: true,
      validate: {
        validator: function(v: string) {
          return /^\d{10}$/.test(v);
        },
        message: (props: { value: string }) => `${props.value} is not a valid 10-digit mobile number!`
      }
    },
    designation: {
      type: String,
      required: true
    },
    departmentName: {
      type: String,
      required: true,
      index: true
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying
BLOSchema.index({ district: 1, acNumber: 1, partNo: 1 });
BLOSchema.index({ mobileNumber: 1 }, { unique: true });

const BLO: Model<IBLO> = mongoose.models.BLO || mongoose.model<IBLO>('BLO', BLOSchema);

export default BLO;
