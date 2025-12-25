import mongoose, { Schema, Model } from 'mongoose';
import { UserRole } from '@/lib/types/user';

// Re-export UserRole for convenience
export { UserRole }

export interface IDefaultUser {
  email: string;
  name: string;
  profileImage?: string;
  provider: string;
  providerId: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

const DefaultUserSchema = new Schema<IDefaultUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    profileImage: {
      type: String,
      required: false
    },
    provider: {
      type: String,
      required: true,
      default: 'google'
    },
    providerId: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
      required: true
    }
  },
  {
    timestamps: true,
    collection: 'defaultusers'
  }
);

// Compound index for provider+providerId for fast lookups during OAuth
DefaultUserSchema.index({ provider: 1, providerId: 1 }, { unique: true });

const DefaultUser: Model<IDefaultUser> =
  mongoose.models.DefaultUser ||
  mongoose.model<IDefaultUser>('DefaultUser', DefaultUserSchema);

export default DefaultUser;
