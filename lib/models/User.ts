import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    image: {
        type: String,
    },
    role: {
        type: String,
        enum: ['USER', 'EDITOR', 'ADMIN'],
        default: 'USER',
    },
}, {
    timestamps: true,
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
