import mongoose, { Schema, Model } from 'mongoose';

export interface ISystemSetting {
    key: string;
    value: string;
    updatedAt?: Date;
}

const SystemSettingSchema = new Schema<ISystemSetting>(
    {
        key: {
            type: String,
            required: true,
            unique: true,
        },
        value: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const SystemSetting: Model<ISystemSetting> =
    mongoose.models.SystemSetting ||
    mongoose.model<ISystemSetting>('SystemSetting', SystemSettingSchema);

export default SystemSetting;
