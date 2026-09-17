import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
    },
    role: {
        type: String,
        enum: ['patient', 'doctor', 'admin'],
        default: 'patient',
    },
    // Doctor specific fields
    specialization: {
        type: String,
    },
    availability: {
        type: [String], // e.g., ['Mon 10-12', 'Wed 14-16']
    },
    image: {
        type: String, // URL to image
    },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
